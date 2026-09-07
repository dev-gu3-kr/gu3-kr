import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"

// 이미지 변환 단위 테스트가 DB 초기화와 연결되지 않도록 query 경계를 대체한다.
vi.mock("./photoArchive.query", () => ({
  bulkUpdateArchivePhotos: vi.fn(),
  createArchivePhotoRecord: vi.fn(),
  findAdminArchivePhotoPage: vi.fn(),
  findArchivePhotoById: vi.fn(),
  findArchiveYears: vi.fn(),
  findOriginalAssetByChecksum: vi.fn(),
  findPublicArchivePhotoById: vi.fn(),
  findPublicArchivePhotoPage: vi.fn(),
  updateArchivePhotoRecord: vi.fn(),
}))

import { prepareArchiveImage } from "./photoArchive.service"

describe("prepareArchiveImage", () => {
  it("원본 바이트를 유지하고 별도 WebP 표시본을 만든다", async () => {
    const original = await sharp({
      create: {
        width: 120,
        height: 80,
        channels: 3,
        background: "#7c2d12",
      },
    })
      .jpeg()
      .toBuffer()
    const originalBytes = new Uint8Array(original.byteLength)
    originalBytes.set(original)
    const file = new File([originalBytes.buffer], "archive.jpg", {
      type: "image/jpeg",
    })

    const result = await prepareArchiveImage(file)

    expect(result.originalBody.equals(original)).toBe(true)
    expect(result.originalMimeType).toBe("image/jpeg")
    expect(result.displayWidth).toBe(120)
    expect(result.displayHeight).toBe(80)
    expect((await sharp(result.displayBody).metadata()).format).toBe("webp")
  })

  it("손상된 이미지를 거부한다", async () => {
    const file = new File(["not-image"], "broken.jpg", {
      type: "image/jpeg",
    })

    await expect(prepareArchiveImage(file)).rejects.toThrow(
      "지원하지 않거나 손상된 이미지입니다.",
    )
  })
})
