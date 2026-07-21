import sharp from "sharp"

const MEBIBYTE = 1024 * 1024

export const CONTENT_IMAGE_UPLOAD_MAX_BYTES = 20 * MEBIBYTE
export const CLERGY_IMAGE_UPLOAD_MAX_BYTES = 10 * MEBIBYTE
export const BULLETIN_UPLOAD_MAX_BYTES = 40 * MEBIBYTE

const WEBP_QUALITY = 90

// 업로드 원본의 방향 정보를 반영한 뒤 모든 신규 이미지를 동일한 WebP 계약으로 정규화한다.
export async function convertImageToWebp(file: File) {
  try {
    const body = await sharp(Buffer.from(await file.arrayBuffer()), {
      animated: true,
    })
      .rotate()
      .webp({ quality: WEBP_QUALITY, alphaQuality: WEBP_QUALITY })
      .toBuffer()

    return {
      body,
      contentType: "image/webp" as const,
      extension: "webp" as const,
    }
  } catch {
    throw new Error("이미지를 WebP 형식으로 변환할 수 없습니다.")
  }
}
