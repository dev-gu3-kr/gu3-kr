import { createHash } from "node:crypto"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import sharp from "sharp"
import {
  inspectPhotoOriginal,
  preparePhotoImage,
} from "@/lib/admin/photo-image"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
} from "@/lib/admin/storage"
import { galleryPhotoCursorSchema } from "../isomorphic/galleryPhotos.schema"
import type {
  AdminGalleryPhotoDto,
  GalleryPhotoDetailDto,
  GalleryPhotoDto,
  GalleryPhotoPageDto,
} from "../isomorphic/galleryPhotos.types"
import {
  claimCleanupAsset,
  claimFileUpload,
  claimProcessingItem,
  completeProcessingItem,
  createStagedAsset,
  createUploadBatch,
  deleteCleanedAsset,
  detachPhoto,
  failUploadItem,
  findGalleryCleanupCandidates,
  findGalleryPost,
  findPhotoNavigation,
  findPhotoPage,
  findPublicPhoto,
  findUploadItem,
  findUploadItems,
  finishFileUpload,
  type PhotoRow,
  retryUploadItem,
  updatePhoto,
  updatePhotoStatuses,
} from "./galleryPhotos.query"

export {
  createUploadBatch,
  findGalleryPost,
  findUploadItems,
  retryUploadItem,
  updatePhoto,
  updatePhotoStatuses,
}

function toPublicDto(row: PhotoRow, title: string): GalleryPhotoDto {
  return {
    id: row.id,
    thumbnailUrl: row.thumbnailAsset.url,
    displayUrl: row.displayAsset.url,
    width: row.displayAsset.width ?? 1,
    height: row.displayAsset.height ?? 1,
    caption: row.caption,
    altText: row.altText?.trim() || `${title} 행사 사진`,
  }
}

export function decodePhotoCursor(cursor?: string) {
  if (!cursor) return undefined
  try {
    if (cursor.length > 500) throw new Error()
    return galleryPhotoCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")),
    )
  } catch {
    throw new Error("올바르지 않은 사진 페이지입니다.")
  }
}

export async function getPhotoPage(input: {
  postId: string
  take: number
  publicOnly: boolean
  cursor?: string
  status?: "PUBLISHED" | "HIDDEN"
}): Promise<
  GalleryPhotoPageDto<AdminGalleryPhotoDto> | GalleryPhotoPageDto | null
> {
  const post = await findGalleryPost(input.postId, input.publicOnly)
  if (!post) return null
  const [rows, totalCount] = await findPhotoPage({
    ...input,
    cursor: decodePhotoCursor(input.cursor),
  })
  const hasMore = rows.length > input.take
  const visible = rows.slice(0, input.take)
  const last = visible.at(-1)
  const items = visible.map((row) =>
    input.publicOnly
      ? toPublicDto(row, post.title)
      : {
          ...toPublicDto(row, post.title),
          status: row.status,
          originalName: row.originalAsset.originalName,
          sortOrder: row.sortOrder,
        },
  )
  return {
    items,
    totalCount,
    nextCursor:
      hasMore && last
        ? Buffer.from(
            JSON.stringify({ order: last.sortOrder, id: last.id }),
          ).toString("base64url")
        : null,
  }
}

export async function getPublicPhotoDetail(
  postId: string,
  photoId: string,
): Promise<GalleryPhotoDetailDto | null> {
  const post = await findGalleryPost(postId, true)
  if (!post) return null
  const row = await findPublicPhoto(postId, photoId)
  return row
    ? {
        item: toPublicDto(row, post.title),
        ...(await findPhotoNavigation(row)),
      }
    : null
}

// 원본을 먼저 보존하고 영속 작업을 QUEUED로 전환한다. 이미지 변환은 별도 작업자가 처리한다.
export async function uploadPhotoOriginal(input: {
  postId: string
  itemId: string
  file: File
}) {
  const item = await findUploadItem(input.postId, input.itemId)
  if (!item) throw new Error("업로드 작업을 찾을 수 없습니다.")
  if (["QUEUED", "PROCESSING", "COMPLETED"].includes(item.status)) return item
  if (
    input.file.name !== item.originalName ||
    input.file.size !== item.sizeBytes
  )
    throw new Error("선택한 파일이 업로드 작업과 일치하지 않습니다.")
  const token = await claimFileUpload(input.postId, input.itemId)
  if (!token) throw new Error("이미 전송 중이거나 취소된 업로드입니다.")
  let stagedId: string | undefined
  try {
    const prepared = await inspectPhotoOriginal(input.file)
    const bucket =
      process.env.MINIO_GALLERY_ORIGINAL_BUCKET ??
      process.env.MINIO_ARCHIVE_ORIGINAL_BUCKET
    if (!bucket) throw new Error("행사 사진 원본 버킷 설정이 비어 있습니다.")
    const objectKey = `gallery-photos/${input.postId}/${input.itemId}/${token}/original.${prepared.originalExtension}`
    const asset = await createStagedAsset({
      bucket,
      objectKey,
      url: `s3://${bucket}/${objectKey}`,
      originalName: input.file.name,
      mimeType: prepared.originalMimeType,
      sizeBytes: prepared.originalBody.byteLength,
      width: prepared.originalWidth,
      height: prepared.originalHeight,
      checksum: prepared.originalChecksum,
      variant: "ORIGINAL",
      uploadedById: item.batch.uploadedById,
    })
    stagedId = asset.id
    await getMinioS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: prepared.originalBody,
        ContentType: prepared.originalMimeType,
      }),
    )
    const completed = await finishFileUpload(item.id, token, asset.id)
    if (!completed.count)
      throw new Error("취소되었거나 다시 시작된 업로드입니다.")
    return await findUploadItem(input.postId, item.id)
  } catch (error) {
    await failUploadItem(
      item.id,
      token,
      error instanceof Error ? error.message : "원본 전송에 실패했습니다.",
    )
    if (stagedId) await cleanupGalleryAssets([stagedId])
    throw error
  }
}

async function processOnePhoto() {
  const item = await claimProcessingItem()
  if (!item?.originalAsset || !item.leaseToken) return false
  const derivedIds: string[] = []
  try {
    const bucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
    if (!bucket) throw new Error("행사 사진 표시 버킷 설정이 비어 있습니다.")
    const client = getMinioS3Client()
    const object = await client.send(
      new GetObjectCommand({
        Bucket: item.originalAsset.bucket,
        Key: item.originalAsset.objectKey,
      }),
    )
    if (!object.Body) throw new Error("보존 원본을 읽을 수 없습니다.")
    const bytes = await object.Body.transformToByteArray()
    const fileBytes = new Uint8Array(bytes.length)
    fileBytes.set(bytes)
    const prepared = await preparePhotoImage(
      new File([fileBytes.buffer], item.originalName),
    )
    if (prepared.originalChecksum !== item.originalAsset.checksum)
      throw new Error("보존 원본의 체크섬이 일치하지 않습니다.")
    const thumbnailBody = await sharp(prepared.displayBody)
      .resize({
        width: 640,
        height: 640,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 78 })
      .toBuffer()
    const thumbnailMetadata = await sharp(thumbnailBody).metadata()
    const root = `gallery-photos/${item.batch.postId}/${item.id}/${item.leaseToken}`
    const assets = []
    for (const variant of [
      {
        name: "display",
        body: prepared.displayBody,
        width: prepared.displayWidth,
        height: prepared.displayHeight,
        variant: "DISPLAY" as const,
      },
      {
        name: "thumbnail",
        body: thumbnailBody,
        width: thumbnailMetadata.width ?? 1,
        height: thumbnailMetadata.height ?? 1,
        variant: "THUMBNAIL" as const,
      },
    ]) {
      const objectKey = `${root}/${variant.name}.webp`
      const asset = await createStagedAsset({
        bucket,
        objectKey,
        url: createMinioPublicObjectUrl(bucket, objectKey),
        originalName: item.originalName,
        mimeType: "image/webp",
        sizeBytes: variant.body.byteLength,
        width: variant.width,
        height: variant.height,
        checksum: createHash("sha256").update(variant.body).digest("hex"),
        variant: variant.variant,
        uploadedById: item.batch.uploadedById,
      })
      derivedIds.push(asset.id)
      assets.push(asset)
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: variant.body,
          ContentType: "image/webp",
        }),
      )
    }
    await completeProcessingItem({
      item,
      displayAssetId: assets[0].id,
      thumbnailAssetId: assets[1].id,
    })
  } catch (error) {
    const duplicate =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    await failUploadItem(
      item.id,
      item.leaseToken,
      duplicate
        ? "같은 행사에 이미 등록된 사진입니다."
        : error instanceof Error
          ? error.message
          : "사진 처리에 실패했습니다.",
    )
    await cleanupGalleryAssets(derivedIds)
  }
  return true
}

// after()와 외부 스케줄러가 같은 DB 대기열을 소비하며 실행 시간이 긴 작업은 다음 호출로 넘긴다.
export async function processQueuedPhotos() {
  const deadline = Date.now() + 45_000
  let processed = 0
  while (Date.now() < deadline && processed < 100) {
    if (!(await processOnePhoto())) break
    processed += 1
  }
  return { processed }
}

export async function cleanupGalleryAssets(ids?: string[]) {
  if (ids?.length === 0) return { deleted: 0, failed: 0 }
  const candidates = await findGalleryCleanupCandidates(ids)
  let deleted = 0
  let failed = 0
  for (const candidate of candidates) {
    try {
      const asset = await claimCleanupAsset(candidate.id)
      if (!asset) continue
      await getMinioS3Client().send(
        new DeleteObjectCommand({ Bucket: asset.bucket, Key: asset.objectKey }),
      )
      const result = await deleteCleanedAsset(asset.id)
      deleted += result.count
    } catch {
      failed += 1
    }
  }
  return { deleted, failed }
}

export async function deletePhoto(postId: string, id: string) {
  const photo = await detachPhoto(postId, id)
  if (!photo) return null
  const result = await cleanupGalleryAssets([
    photo.originalAsset.id,
    photo.displayAsset.id,
    photo.thumbnailAsset.id,
  ])
  return { id, cleanupPending: result.failed > 0 }
}
