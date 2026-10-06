import { createHash } from "node:crypto"
import sharp from "sharp"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  findGalleryPost: vi.fn(),
  findPhotoPage: vi.fn(),
  claimProcessingItem: vi.fn(),
  completeProcessingItem: vi.fn(),
  createStagedAsset: vi.fn(),
  failUploadItem: vi.fn(),
  findGalleryCleanupCandidates: vi.fn(),
  claimCleanupAsset: vi.fn(),
  deleteCleanedAsset: vi.fn(),
  send: vi.fn(),
}))
vi.mock("./galleryPhotos.query", () => ({
  ...mocks,
  claimFileUpload: vi.fn(),
  createUploadBatch: vi.fn(),
  detachPhoto: vi.fn(),
  findPhotoNavigation: vi.fn(),
  findPublicPhoto: vi.fn(),
  findUploadItem: vi.fn(),
  findUploadItems: vi.fn(),
  finishFileUpload: vi.fn(),
  retryUploadItem: vi.fn(),
  updatePhoto: vi.fn(),
  updatePhotoStatuses: vi.fn(),
}))
vi.mock("@/lib/admin/storage", () => ({
  getMinioS3Client: () => ({ send: mocks.send }),
  createMinioPublicObjectUrl: (bucket: string, key: string) =>
    `https://images.example/${bucket}/${key}`,
}))

import {
  cleanupGalleryAssets,
  decodePhotoCursor,
  getPhotoPage,
  processQueuedPhotos,
} from "./galleryPhotos.service"

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv("MINIO_PUBLIC_IMAGE_BUCKET", "public")
  mocks.findGalleryCleanupCandidates.mockResolvedValue([])
})

describe("행사별 사진 조회", () => {
  it("비공개 또는 없는 행사에는 사진 조회를 실행하지 않는다", async () => {
    mocks.findGalleryPost.mockResolvedValue(null)
    expect(
      await getPhotoPage({ postId: "hidden", publicOnly: true, take: 48 }),
    ).toBeNull()
    expect(mocks.findGalleryPost).toHaveBeenCalledWith("hidden", true)
    expect(mocks.findPhotoPage).not.toHaveBeenCalled()
  })
  it("공개 DTO에서 원본 저장 위치와 관리자 메타데이터를 제거하고 정렬값 커서를 반환한다", async () => {
    const row = {
      id: "photo-a",
      postId: "event",
      sortOrder: 7,
      status: "PUBLISHED",
      caption: null,
      altText: null,
      originalAsset: {
        url: "s3://private/original.jpg",
        originalName: "private-name.jpg",
      },
      displayAsset: {
        url: "https://images.example/display.webp",
        width: 100,
        height: 80,
      },
      thumbnailAsset: { url: "https://images.example/thumb.webp" },
    }
    mocks.findGalleryPost.mockResolvedValue({ id: "event", title: "성탄 행사" })
    mocks.findPhotoPage.mockResolvedValue([[row, { ...row, id: "photo-b" }], 2])
    const page = await getPhotoPage({
      postId: "event",
      publicOnly: true,
      take: 1,
    })
    expect(page?.items).toHaveLength(1)
    expect(JSON.stringify(page)).not.toContain("private")
    expect(page?.items[0].altText).toBe("성탄 행사 행사 사진")
    expect(decodePhotoCursor(page?.nextCursor ?? undefined)).toEqual({
      order: 7,
      id: "photo-a",
    })
    expect(() => decodePhotoCursor("broken")).toThrow("올바르지")
  })
})

describe("영속 사진 변환 작업", () => {
  async function queuedOriginal() {
    const body = await sharp({
      create: { width: 1000, height: 800, channels: 3, background: "#a0242b" },
    })
      .jpeg()
      .toBuffer()
    const item = {
      id: "job",
      leaseToken: "lease",
      sortOrder: 2,
      originalName: "photo.jpg",
      batch: { postId: "event", uploadedById: "admin" },
      originalAsset: {
        id: "original",
        bucket: "private",
        objectKey: "original.jpg",
        checksum: createHash("sha256").update(body).digest("hex"),
      },
    }
    mocks.claimProcessingItem
      .mockResolvedValueOnce(item)
      .mockResolvedValue(null)
    mocks.send.mockImplementation(async (command) =>
      command.constructor.name === "GetObjectCommand"
        ? { Body: { transformToByteArray: async () => new Uint8Array(body) } }
        : {},
    )
    mocks.createStagedAsset.mockImplementation(async (input) => ({
      ...input,
      id: input.variant.toLowerCase(),
    }))
    return item
  }
  it("확대 표시본과 640px 썸네일을 만들고 원본과 함께 완료 처리한다", async () => {
    await queuedOriginal()
    await processQueuedPhotos()
    const assets = mocks.createStagedAsset.mock.calls.map(([asset]) => asset)
    expect(assets.map((asset) => asset.variant)).toEqual([
      "DISPLAY",
      "THUMBNAIL",
    ])
    expect(assets[1].width).toBe(640)
    expect(assets[1].height).toBe(512)
    expect(mocks.completeProcessingItem).toHaveBeenCalledWith(
      expect.objectContaining({
        displayAssetId: "display",
        thumbnailAssetId: "thumbnail",
      }),
    )
    expect(mocks.failUploadItem).not.toHaveBeenCalled()
  })
  it("행사 내 중복 제약이 실패하면 사진을 완료 처리하지 않고 실패를 기록한다", async () => {
    await queuedOriginal()
    mocks.completeProcessingItem.mockRejectedValue({ code: "P2002" })
    await processQueuedPhotos()
    expect(mocks.failUploadItem).toHaveBeenCalledWith(
      "job",
      "lease",
      "같은 행사에 이미 등록된 사진입니다.",
    )
    expect(mocks.findGalleryCleanupCandidates).toHaveBeenCalledWith([
      "display",
      "thumbnail",
    ])
  })
})

describe("행사 사진 파일 정리", () => {
  it("실제 객체 삭제가 실패한 자산은 후속 재시도를 위해 DB에 남긴다", async () => {
    const asset = { id: "asset", bucket: "private", objectKey: "original.jpg" }
    mocks.findGalleryCleanupCandidates.mockResolvedValue([asset])
    mocks.claimCleanupAsset.mockResolvedValue(asset)
    mocks.send.mockRejectedValue(new Error("storage unavailable"))
    expect(await cleanupGalleryAssets(["asset"])).toEqual({
      deleted: 0,
      failed: 1,
    })
    expect(mocks.deleteCleanedAsset).not.toHaveBeenCalled()
  })
})
