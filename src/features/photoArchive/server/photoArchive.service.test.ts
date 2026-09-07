import sharp from "sharp"
import { beforeEach, describe, expect, it, vi } from "vitest"

const queryMocks = vi.hoisted(() => ({
  deleteArchivePhotoRecord: vi.fn(),
  deleteDetachedArchiveAssets: vi.fn(),
}))
const storageMocks = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock("@/lib/admin/storage", () => ({
  createMinioPublicObjectUrl: vi.fn(),
  getMinioS3Client: () => ({ send: storageMocks.send }),
}))

// 이미지 변환 단위 테스트가 DB 초기화와 연결되지 않도록 query 경계를 대체한다.
vi.mock("./photoArchive.query", () => ({
  bulkUpdateArchivePhotos: vi.fn(),
  createArchivePhotoRecord: vi.fn(),
  deleteArchivePhotoRecord: queryMocks.deleteArchivePhotoRecord,
  deleteDetachedArchiveAssets: queryMocks.deleteDetachedArchiveAssets,
  findAdminArchivePhotoPage: vi.fn(),
  findArchivePhotoById: vi.fn(),
  findArchiveYears: vi.fn(),
  findOriginalAssetByChecksum: vi.fn(),
  findPublicArchivePhotoById: vi.fn(),
  findPublicArchivePhotoPage: vi.fn(),
  updateArchivePhotoRecord: vi.fn(),
}))

import { deleteArchivePhoto, prepareArchiveImage } from "./photoArchive.service"

beforeEach(() => {
  vi.clearAllMocks()
})

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

describe("deleteArchivePhoto", () => {
  const target = {
    id: "photo-1",
    originalAsset: {
      id: "original-asset",
      bucket: "live-private",
      objectKey: "photo-archive/photo-1/original.jpg",
    },
    displayAsset: {
      id: "display-asset",
      bucket: "live",
      objectKey: "photo-archive/photo-1/display.webp",
    },
  }

  it("DB 사진을 제거한 뒤 원본과 표시본 객체 및 자산 레코드를 정리한다", async () => {
    queryMocks.deleteArchivePhotoRecord.mockResolvedValue(target)
    queryMocks.deleteDetachedArchiveAssets.mockResolvedValue({ count: 2 })
    storageMocks.send.mockResolvedValue({})

    const result = await deleteArchivePhoto(target.id)

    expect(result).toEqual({ id: target.id, cleanupPending: false })
    expect(storageMocks.send).toHaveBeenCalledTimes(2)
    expect(
      storageMocks.send.mock.calls.map(([command]) => command.input),
    ).toEqual([
      {
        Bucket: target.originalAsset.bucket,
        Key: target.originalAsset.objectKey,
      },
      {
        Bucket: target.displayAsset.bucket,
        Key: target.displayAsset.objectKey,
      },
    ])
    expect(queryMocks.deleteDetachedArchiveAssets).toHaveBeenCalledWith([
      target.originalAsset.id,
      target.displayAsset.id,
    ])
  })

  it("저장소 일부 정리가 실패하면 해당 자산 레코드를 남기고 후속 정리를 알린다", async () => {
    queryMocks.deleteArchivePhotoRecord.mockResolvedValue(target)
    queryMocks.deleteDetachedArchiveAssets.mockResolvedValue({ count: 1 })
    storageMocks.send
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("storage unavailable"))

    const result = await deleteArchivePhoto(target.id)

    expect(result).toEqual({ id: target.id, cleanupPending: true })
    expect(queryMocks.deleteDetachedArchiveAssets).toHaveBeenCalledWith([
      target.originalAsset.id,
    ])
  })
})
