import { z } from "zod"

const MEBIBYTE = 1024 * 1024

export const PHOTO_ARCHIVE_MAX_FILES = 100
export const PHOTO_ARCHIVE_MAX_FILE_BYTES = 100 * MEBIBYTE
export const PHOTO_ARCHIVE_MAX_BATCH_BYTES = 2 * 1024 * MEBIBYTE
export const PHOTO_ARCHIVE_MAX_PIXELS = 100_000_000
export const PHOTO_ARCHIVE_UPLOAD_CONCURRENCY = 3

export const PHOTO_ARCHIVE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
] as const

export const archivePhotoYearSchema = z
  .number()
  .int("연도는 정수여야 합니다.")
  .min(1800, "연도는 1800년 이후여야 합니다.")
  .max(new Date().getFullYear(), "연도는 현재 연도보다 클 수 없습니다.")

export const archivePhotoStatusSchema = z.enum(["PUBLISHED", "HIDDEN"])

export const updateArchivePhotoSchema = z
  .object({
    year: archivePhotoYearSchema.optional(),
    status: archivePhotoStatusSchema.optional(),
    caption: z.string().trim().max(2000).nullable().optional(),
    altText: z.string().trim().max(300).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "변경할 값을 입력해 주세요.",
  })

export const bulkArchivePhotoSchema = z
  .object({
    action: z.enum(["CHANGE_STATUS", "CHANGE_YEAR"]),
    photoIds: z.array(z.string().min(1)).min(1).max(PHOTO_ARCHIVE_MAX_FILES),
    year: archivePhotoYearSchema.optional(),
    status: archivePhotoStatusSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.action === "CHANGE_YEAR" && value.year === undefined) {
      context.addIssue({
        code: "custom",
        path: ["year"],
        message: "변경할 연도를 입력해 주세요.",
      })
    }
    if (value.action === "CHANGE_STATUS" && value.status === undefined) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "변경할 상태를 선택해 주세요.",
      })
    }
  })

export function validateArchiveUploadSelection(files: readonly File[]) {
  if (files.length === 0) return "사진 파일을 선택해 주세요."
  if (files.length > PHOTO_ARCHIVE_MAX_FILES) {
    return `한 번에 ${PHOTO_ARCHIVE_MAX_FILES}장까지 선택할 수 있습니다.`
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0)
  if (totalBytes > PHOTO_ARCHIVE_MAX_BATCH_BYTES) {
    return "한 번의 업로드 대기열은 2GB 이하여야 합니다."
  }

  const oversized = files.find(
    (file) => file.size > PHOTO_ARCHIVE_MAX_FILE_BYTES,
  )
  if (oversized) return `${oversized.name} 파일은 100MB 이하여야 합니다.`

  const unsupported = files.find(
    (file) =>
      !PHOTO_ARCHIVE_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof PHOTO_ARCHIVE_ALLOWED_MIME_TYPES)[number],
      ),
  )
  if (unsupported) return `${unsupported.name} 파일 형식은 지원하지 않습니다.`

  return null
}
