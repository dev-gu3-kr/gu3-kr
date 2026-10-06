import { createHash } from "node:crypto"
import sharp from "sharp"

export const PHOTO_UPLOAD_MAX_FILE_BYTES = 100 * 1024 * 1024
export const PHOTO_UPLOAD_MAX_PIXELS = 100_000_000
export const PHOTO_UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
] as const

const DISPLAY_MAX_EDGE = 2560
const DISPLAY_WEBP_QUALITY = 84

const FORMAT_CONTRACT = {
  jpeg: { extension: "jpg", mimeType: "image/jpeg" },
  png: { extension: "png", mimeType: "image/png" },
  tiff: { extension: "tif", mimeType: "image/tiff" },
  webp: { extension: "webp", mimeType: "image/webp" },
} as const

// 실제 이미지 포맷을 확인하고 원본 바이트를 그대로 보존한다.
export async function inspectPhotoOriginal(file: File) {
  if (file.size === 0) throw new Error("비어 있는 파일은 등록할 수 없습니다.")
  if (file.size > PHOTO_UPLOAD_MAX_FILE_BYTES) {
    throw new Error("파일 용량은 100MB 이하여야 합니다.")
  }

  const originalBody = Buffer.from(await file.arrayBuffer())
  const image = sharp(originalBody, {
    limitInputPixels: PHOTO_UPLOAD_MAX_PIXELS,
  })
  const metadata = await image.metadata().catch(() => null)
  const format = metadata?.format as keyof typeof FORMAT_CONTRACT | undefined
  const contract = format ? FORMAT_CONTRACT[format] : undefined

  if (!metadata?.width || !metadata.height || !contract) {
    throw new Error("지원하지 않거나 손상된 이미지입니다.")
  }
  if (
    !PHOTO_UPLOAD_ALLOWED_MIME_TYPES.includes(
      contract.mimeType as (typeof PHOTO_UPLOAD_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new Error("지원하지 않는 이미지 형식입니다.")
  }
  if (metadata.width * metadata.height > PHOTO_UPLOAD_MAX_PIXELS) {
    throw new Error("이미지 해상도는 100메가픽셀 이하여야 합니다.")
  }

  return {
    originalBody,
    originalExtension: contract.extension,
    originalMimeType: contract.mimeType,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    originalChecksum: createHash("sha256").update(originalBody).digest("hex"),
  }
}

// 원본과 별도로 방향을 보정한 WebP 표시본을 생성한다.
export async function preparePhotoImage(file: File) {
  const original = await inspectPhotoOriginal(file)
  const { originalBody } = original
  const displayBody = await sharp(originalBody, {
    limitInputPixels: PHOTO_UPLOAD_MAX_PIXELS,
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
    ...original,
    displayBody,
    displayWidth: displayMetadata.width ?? 1,
    displayHeight: displayMetadata.height ?? 1,
    displayChecksum: createHash("sha256").update(displayBody).digest("hex"),
  }
}
