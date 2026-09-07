import { describe, expect, it } from "vitest"
import {
  archivePhotoStatusSchema,
  archivePhotoYearSchema,
  bulkArchivePhotoSchema,
  PHOTO_ARCHIVE_MAX_FILE_BYTES,
  validateArchiveUploadSelection,
} from "./photoArchive.schema"

describe("photo archive schema", () => {
  it("현실적인 4자리 연도만 허용한다", () => {
    expect(archivePhotoYearSchema.safeParse(1987).success).toBe(true)
    expect(archivePhotoYearSchema.safeParse(1799).success).toBe(false)
    expect(
      archivePhotoYearSchema.safeParse(new Date().getFullYear() + 1).success,
    ).toBe(false)
  })

  it("연도 변경 일괄 작업은 새 연도를 요구한다", () => {
    expect(
      bulkArchivePhotoSchema.safeParse({
        action: "CHANGE_YEAR",
        photoIds: ["photo-1"],
      }).success,
    ).toBe(false)
  })

  it("사진 상태는 공개와 숨김만 허용한다", () => {
    expect(archivePhotoStatusSchema.safeParse("PUBLISHED").success).toBe(true)
    expect(archivePhotoStatusSchema.safeParse("HIDDEN").success).toBe(true)
    expect(archivePhotoStatusSchema.safeParse("DRAFT").success).toBe(false)
  })

  it("일괄 상태 변경은 공개 또는 숨김 상태를 요구한다", () => {
    expect(
      bulkArchivePhotoSchema.safeParse({
        action: "CHANGE_STATUS",
        photoIds: ["photo-1"],
      }).success,
    ).toBe(false)
    expect(
      bulkArchivePhotoSchema.safeParse({
        action: "CHANGE_STATUS",
        photoIds: ["photo-1"],
        status: "HIDDEN",
      }).success,
    ).toBe(true)
    expect(
      bulkArchivePhotoSchema.safeParse({
        action: "TRASH",
        photoIds: ["photo-1"],
      }).success,
    ).toBe(false)
  })

  it("파일당 용량과 MIME을 클라이언트에서도 사전 검사한다", () => {
    const tooLarge = new File([new Uint8Array(1)], "large.jpg", {
      type: "image/jpeg",
    })
    Object.defineProperty(tooLarge, "size", {
      value: PHOTO_ARCHIVE_MAX_FILE_BYTES + 1,
    })

    expect(validateArchiveUploadSelection([tooLarge])).toContain("100MB")
    expect(
      validateArchiveUploadSelection([
        new File(["text"], "memo.txt", { type: "text/plain" }),
      ]),
    ).toContain("지원하지 않습니다")
  })
})
