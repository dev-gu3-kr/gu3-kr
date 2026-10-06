import { z } from "zod"

export const GALLERY_PHOTO_MAX_FILES = 100
export const GALLERY_PHOTO_MAX_FILE_BYTES = 100 * 1024 * 1024
export const GALLERY_PHOTO_MAX_BATCH_BYTES = 2 * 1024 * 1024 * 1024
export const GALLERY_PHOTO_UPLOAD_CONCURRENCY = 3
export const GALLERY_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
] as const

export const galleryUploadBatchSchema = z
  .object({
    id: z.uuid(),
    files: z
      .array(
        z.object({
          id: z.uuid(),
          name: z.string().trim().min(1).max(255),
          size: z.number().int().min(1).max(GALLERY_PHOTO_MAX_FILE_BYTES),
        }),
      )
      .min(1)
      .max(GALLERY_PHOTO_MAX_FILES),
  })
  .superRefine(({ files }, context) => {
    if (
      files.reduce((sum, file) => sum + file.size, 0) >
      GALLERY_PHOTO_MAX_BATCH_BYTES
    ) {
      context.addIssue({
        code: "custom",
        message: "업로드 대기열은 2GB 이하여야 합니다.",
      })
    }
    if (new Set(files.map((file) => file.id)).size !== files.length) {
      context.addIssue({
        code: "custom",
        message: "중복된 업로드 식별자입니다.",
      })
    }
  })

export const galleryPhotoUpdateSchema = z
  .object({
    status: z.enum(["PUBLISHED", "HIDDEN"]).optional(),
    caption: z.string().trim().max(2000).nullable().optional(),
    altText: z.string().trim().max(300).nullable().optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "변경할 값을 입력해 주세요.",
  )

export const galleryPhotoBulkSchema = z.object({
  photoIds: z.array(z.string().min(1)).min(1).max(100),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
})

export const galleryPhotoCursorSchema = z.object({
  order: z.number().int().min(0),
  id: z.string().min(1).max(100),
})

// 선택한 묶음만 제한하며 행사 전체 사진 장수에는 제한을 두지 않는다.
export function validateGalleryPhotoSelection(files: readonly File[]) {
  const parsed = galleryUploadBatchSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000000",
    files: files.map((file, index) => ({
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      name: file.name,
      size: file.size,
    })),
  })
  if (!parsed.success)
    return "한 번에 100장·파일당 100MB·전체 2GB 이하의 사진을 선택해 주세요."
  const unsupported = files.find(
    (file) =>
      !GALLERY_PHOTO_MIME_TYPES.includes(
        file.type as (typeof GALLERY_PHOTO_MIME_TYPES)[number],
      ),
  )
  return unsupported
    ? `${unsupported.name} 파일 형식은 지원하지 않습니다.`
    : null
}
