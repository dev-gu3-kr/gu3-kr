import { randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { ArchivePhotoStatus } from "@prisma/client"
import { preparePhotoImage } from "@/lib/admin/photo-image"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
} from "@/lib/admin/storage"
import type {
  AdminArchivePhotoDto,
  PublicArchivePhotoDto,
} from "../isomorphic/photoArchive.types"
import {
  type ArchivePhotoRow,
  bulkUpdateArchivePhotos,
  createArchivePhotoRecord,
  deleteArchivePhotoRecord,
  deleteDetachedArchiveAssets,
  findAdminArchivePhotoPage,
  findArchivePhotoById,
  findArchiveYears,
  findOriginalAssetByChecksum,
  findPublicArchivePhotoById,
  findPublicArchivePhotoPage,
  updateArchivePhotoRecord,
} from "./photoArchive.query"

function toAdminDto(row: ArchivePhotoRow): AdminArchivePhotoDto {
  return {
    id: row.id,
    year: row.year,
    status: row.status,
    sortOrder: row.sortOrder,
    caption: row.caption,
    altText: row.altText,
    originalName: row.originalAsset.originalName,
    originalSizeBytes: row.originalAsset.sizeBytes,
    displayUrl: row.displayAsset.url,
    width: row.displayAsset.width ?? 1,
    height: row.displayAsset.height ?? 1,
    createdAt: row.createdAt.toISOString(),
  }
}

function toPublicDto(row: ArchivePhotoRow): PublicArchivePhotoDto {
  return {
    id: row.id,
    year: row.year,
    displayUrl: row.displayAsset.url,
    width: row.displayAsset.width ?? 1,
    height: row.displayAsset.height ?? 1,
    caption: row.caption,
    altText: row.altText?.trim() || `${row.year}년 구로3동성당 기록 사진`,
  }
}

export { preparePhotoImage as prepareArchiveImage } from "@/lib/admin/photo-image"

export async function uploadArchivePhoto(input: {
  file: File
  year: number
  uploadedById: string
  sourcePath?: string
}) {
  const prepared = await preparePhotoImage(input.file)
  const duplicate = await findOriginalAssetByChecksum(prepared.originalChecksum)
  if (duplicate) {
    return {
      duplicate: true as const,
      message: `이미 등록된 원본과 같습니다: ${duplicate.originalName}`,
    }
  }

  const originalBucket = process.env.MINIO_ARCHIVE_ORIGINAL_BUCKET
  const displayBucket = process.env.MINIO_PUBLIC_IMAGE_BUCKET
  if (!originalBucket || !displayBucket) {
    throw new Error("사진 아카이브 MinIO 버킷 설정이 비어 있습니다.")
  }

  const photoId = randomUUID()
  const originalKey = `photo-archive/${photoId}/original.${prepared.originalExtension}`
  const displayKey = `photo-archive/${photoId}/display.webp`
  const displayUrl = createMinioPublicObjectUrl(displayBucket, displayKey)
  const client = getMinioS3Client()

  await client.send(
    new PutObjectCommand({
      Bucket: originalBucket,
      Key: originalKey,
      Body: prepared.originalBody,
      ContentType: prepared.originalMimeType,
    }),
  )

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: displayBucket,
        Key: displayKey,
        Body: prepared.displayBody,
        ContentType: "image/webp",
      }),
    )

    const row = await createArchivePhotoRecord({
      id: photoId,
      year: input.year,
      sourcePath: input.sourcePath,
      uploadedById: input.uploadedById,
      original: {
        bucket: originalBucket,
        objectKey: originalKey,
        url: `s3://${originalBucket}/${originalKey}`,
        originalName: input.file.name,
        mimeType: prepared.originalMimeType,
        sizeBytes: prepared.originalBody.byteLength,
        width: prepared.originalWidth,
        height: prepared.originalHeight,
        checksum: prepared.originalChecksum,
      },
      display: {
        bucket: displayBucket,
        objectKey: displayKey,
        url: displayUrl,
        originalName: `${input.file.name.replace(/\.[^.]+$/, "")}.webp`,
        mimeType: "image/webp",
        sizeBytes: prepared.displayBody.byteLength,
        width: prepared.displayWidth,
        height: prepared.displayHeight,
        checksum: prepared.displayChecksum,
      },
    })
    return { duplicate: false as const, item: toAdminDto(row) }
  } catch (error) {
    await Promise.allSettled([
      client.send(
        new DeleteObjectCommand({ Bucket: originalBucket, Key: originalKey }),
      ),
      client.send(
        new DeleteObjectCommand({ Bucket: displayBucket, Key: displayKey }),
      ),
    ])
    throw error
  }
}

export async function getAdminArchivePhotoPage(input: {
  take: number
  cursor?: string
  year?: number
  status?: ArchivePhotoStatus
}) {
  const [rows, years] = await Promise.all([
    findAdminArchivePhotoPage(input),
    findArchiveYears({ publishedOnly: false }),
  ])
  const hasMore = rows.length > input.take
  const pageRows = hasMore ? rows.slice(0, input.take) : rows
  return {
    items: pageRows.map(toAdminDto),
    years,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? (pageRows.at(-1)?.id ?? null) : null,
    },
  }
}

export async function getPublicArchivePhotoPage(input: {
  take: number
  cursor?: string
  year?: number
}) {
  const [rows, years] = await Promise.all([
    findPublicArchivePhotoPage(input),
    findArchiveYears({ publishedOnly: true }),
  ])
  const hasMore = rows.length > input.take
  const pageRows = hasMore ? rows.slice(0, input.take) : rows
  return {
    items: pageRows.map(toPublicDto),
    years,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? (pageRows.at(-1)?.id ?? null) : null,
    },
  }
}

export async function getAdminArchivePhoto(id: string) {
  const row = await findArchivePhotoById(id)
  return row ? toAdminDto(row) : null
}

export async function getPublicArchivePhoto(id: string) {
  const row = await findPublicArchivePhotoById(id)
  return row ? toPublicDto(row) : null
}

export async function updateArchivePhoto(input: {
  id: string
  changedById: string
  year?: number
  status?: ArchivePhotoStatus
  caption?: string | null
  altText?: string | null
}) {
  const row = await updateArchivePhotoRecord(input)
  return row ? toAdminDto(row) : null
}

// 공개 노출을 먼저 끊고, 실제 삭제에 성공한 객체의 자산 레코드만 제거해 실패 대상을 추적 가능하게 남긴다.
export async function deleteArchivePhoto(id: string) {
  const client = getMinioS3Client()
  const target = await deleteArchivePhotoRecord(id)
  if (!target) return null

  const assets = [target.originalAsset, target.displayAsset]
  const objectResults = await Promise.allSettled(
    assets.map((asset) =>
      client.send(
        new DeleteObjectCommand({
          Bucket: asset.bucket,
          Key: asset.objectKey,
        }),
      ),
    ),
  )
  const deletedAssetIds = assets.flatMap((asset, index) =>
    objectResults[index]?.status === "fulfilled" ? [asset.id] : [],
  )
  let cleanupPending = deletedAssetIds.length !== assets.length

  if (deletedAssetIds.length > 0) {
    try {
      const removed = await deleteDetachedArchiveAssets(deletedAssetIds)
      cleanupPending ||= removed.count !== deletedAssetIds.length
    } catch {
      cleanupPending = true
    }
  }

  return { id: target.id, cleanupPending }
}

export function runBulkArchivePhotoAction(input: {
  ids: string[]
  action: "CHANGE_STATUS" | "CHANGE_YEAR"
  changedById: string
  year?: number
  status?: ArchivePhotoStatus
}) {
  return bulkUpdateArchivePhotos(input)
}
