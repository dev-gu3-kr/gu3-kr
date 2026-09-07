import { beforeEach, describe, expect, it, vi } from "vitest"

const fileAssetMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  deleteMany: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    fileAsset: fileAssetMocks,
  },
}))

import {
  deleteUnusedFileAssetById,
  findCleanupCandidates,
  findUnusedFileAssetById,
  findUnusedFileAssetByReference,
} from "./content-images.query"

describe("content image cleanup query", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("아카이브 원본·표시본을 미사용 게시글 자산 정리에서 제외한다", async () => {
    const before = new Date("2026-09-01T00:00:00.000Z")

    await findCleanupCandidates({ before, take: 20 })
    await findUnusedFileAssetById("asset-1")
    await deleteUnusedFileAssetById("asset-1")
    await findUnusedFileAssetByReference({ objectKey: "data/example.webp" })

    expect(fileAssetMocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ variant: "GENERAL" }),
      }),
    )
    for (const call of fileAssetMocks.findFirst.mock.calls) {
      expect(call[0].where.variant).toBe("GENERAL")
    }
    expect(fileAssetMocks.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ variant: "GENERAL" }),
      }),
    )
  })
})
