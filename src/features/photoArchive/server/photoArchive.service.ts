import { createHash, randomUUID } from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { ArchivePhotoStatus } from "@prisma/client"
import sharp from "sharp"
import {
  createMinioPublicObjectUrl,
  getMinioS3Client,
} from "@/lib/admin/storage"
import {
  PHOTO_ARCHIVE_ALLOWED_MIME_TYPES,
  PHOTO_ARCHIVE_MAX_FILE_BYTES,
  PHOTO_ARCHIVE_MAX_PIXELS,
} from "../isomorphic/photoArchive.schema"
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

const DISPLAY_MAX_EDGE = 2560
const DISPLAY_WEBP_QUALITY = 84

const FORMAT_CONTRACT = {
  jpeg: { extension: "jpg", mimeType: "image/jpeg" },
  png: { extension: "png", mimeType: "image/png" },
  tiff: { extension: "tif", mimeType: "image/tiff" },
  webp: { extension: "webp", mimeType: "image/webp" },
} as const

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

export async function prepareArchiveImage(file: File) {
  if (file.size === 0) throw new Error("비어 있는 파일은 등록할 수 없습니다.")
  if (file.size > PHOTO_ARCHIVE_MAX_FILE_BYTES) {
    throw new Error("파일 용량은 100MB 이하여야 합니다.")
  }

  const originalBody = Buffer.from(await file.arrayBuffer())
  const image = sharp(originalBody, {
    limitInputPixels: PHOTO_ARCHIVE_MAX_PIXELS,
  })
  const metadata = await image.metadata().catch(() => null)
  const format = metadata?.format as keyof typeof FORMAT_CONTRACT | undefined
  const contract = format ? FORMAT_CONTRACT[format] : undefined

  if (!metadata?.width || !metadata.height || !contract) {
    throw new Error("지원하지 않거나 손상된 이미지입니다.")
  }
  if (
    !PHOTO_ARCHIVE_ALLOWED_MIME_TYPES.includes(
      contract.mimeType as (typeof PHOTO_ARCHIVE_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new Error("지원하지 않는 이미지 형식입니다.")
  }
  if (metadata.width * metadata.height > PHOTO_ARCHIVE_MAX_PIXELS) {
    throw new Error("이미지 해상도는 100메가픽셀 이하여야 합니다.")
  }

  const displayBody = await sharp(originalBody, {
    limitInputPixels: PHOTO_ARCHIVE_MAX_PIXELS,
  })
    .rotate()
    .resize({
      width: DISPLAY_MAX_EDGE,
      height: DISPLAY_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: DISPLAY_WEBP_QUALITY, alphaQuality: DISPLAY_WEBP_QUALITY })
    .toBuffer()
  const displayMetadata = await sharp(displayBody).metadata()

  return {
    originalBody,
    originalExtension: contract.extension,
    originalMimeType: contract.mimeType,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    originalChecksum: createHash("sha256").update(originalBody).digest("hex"),
    displayBody,
    displayWidth: displayMetadata.width ?? 1,
    displayHeight: displayMetadata.height ?? 1,
    displayChecksum: createHash("sha256").update(displayBody).digest("hex"),
  }
}

export async function uploadArchivePhoto(input: {
  file: File
  year: number
  uploadedById: string
  sourcePath?: string
}) {
  const prepared = await prepareArchiveImage(input.file)
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
