import { randomUUID } from "node:crypto"
import { describe, expect, it } from "vitest"
import {
  galleryPhotoBulkSchema,
  galleryUploadBatchSchema,
  validateGalleryPhotoSelection,
} from "./galleryPhotos.schema"

describe("행사 사진 업로드 제한", () => {
  const file = () => ({ id: randomUUID(), name: "photo.jpg", size: 1 })
  it("묶음은 100장까지 허용하고 같은 식별자를 중복 등록하지 않는다", () => {
    const files = Array.from({ length: 100 }, file)
    expect(
      galleryUploadBatchSchema.safeParse({ id: randomUUID(), files }).success,
    ).toBe(true)
    expect(
      galleryUploadBatchSchema.safeParse({
        id: randomUUID(),
        files: [...files, file()],
      }).success,
    ).toBe(false)
    expect(
      galleryUploadBatchSchema.safeParse({
        id: randomUUID(),
        files: [files[0], files[0]],
      }).success,
    ).toBe(false)
  })
  it("개별 100MB와 묶음 2GB 제한을 서버에서도 검증한다", () => {
    expect(
      galleryUploadBatchSchema.safeParse({
        id: randomUUID(),
        files: [{ ...file(), size: 100 * 1024 * 1024 + 1 }],
      }).success,
    ).toBe(false)
    expect(
      galleryUploadBatchSchema.safeParse({
        id: randomUUID(),
        files: Array.from({ length: 21 }, () => ({
          ...file(),
          size: 100 * 1024 * 1024,
        })),
      }).success,
    ).toBe(false)
  })
  it("빈 파일과 지원하지 않는 형식을 선택 단계에서 거부한다", () => {
    expect(
      validateGalleryPhotoSelection([
        new File([], "empty.jpg", { type: "image/jpeg" }),
      ]),
    ).toBeTruthy()
    expect(
      validateGalleryPhotoSelection([
        new File(["x"], "photo.gif", { type: "image/gif" }),
      ]),
    ).toContain("지원하지")
    expect(
      validateGalleryPhotoSelection([
        new File(["x"], "photo.jpg", { type: "image/jpeg" }),
      ]),
    ).toBeNull()
  })
  it("일괄 공개는 행사 사진 식별자와 명시적 상태를 요구한다", () => {
    expect(
      galleryPhotoBulkSchema.safeParse({ photoIds: [], status: "PUBLISHED" })
        .success,
    ).toBe(false)
    expect(
      galleryPhotoBulkSchema.safeParse({
        photoIds: ["photo"],
        status: "ARCHIVED",
      }).success,
    ).toBe(false)
  })
})
