import { randomUUID } from "node:crypto"
import type { Prisma } from "@prisma/client"
import { prisma, prismaPostTable } from "@/lib/prisma"

const assetSelect = {
  id: true,
  bucket: true,
  objectKey: true,
  url: true,
  width: true,
  height: true,
  originalName: true,
} as const
export const photoSelect = {
  id: true,
  postId: true,
  status: true,
  sortOrder: true,
  caption: true,
  altText: true,
  originalAsset: { select: assetSelect },
  displayAsset: { select: assetSelect },
  thumbnailAsset: { select: assetSelect },
} satisfies Prisma.GalleryPhotoSelect
export type PhotoRow = Prisma.GalleryPhotoGetPayload<{
  select: typeof photoSelect
}>
const uploadInclude = { originalAsset: true, batch: true } as const
export type UploadRow = Prisma.GalleryUploadItemGetPayload<{
  include: typeof uploadInclude
}>
const LEASE_MS = 10 * 60 * 1000

export function findGalleryPost(postId: string, publishedOnly = false) {
  return prisma.post.findFirst({
    where: {
      id: postId,
      category: "GALLERY",
      ...(publishedOnly ? { isPublished: true } : {}),
    },
    select: { id: true, title: true },
  })
}

export function findPhotoPage(input: {
  postId: string
  take: number
  publicOnly: boolean
  cursor?: { order: number; id: string }
  status?: "PUBLISHED" | "HIDDEN"
}) {
  const where: Prisma.GalleryPhotoWhereInput = {
    postId: input.postId,
    ...(input.publicOnly
      ? {
          status: "PUBLISHED",
          post: { category: "GALLERY", isPublished: true },
        }
      : input.status
        ? { status: input.status }
        : {}),
  }
  return Promise.all([
    prisma.galleryPhoto.findMany({
      where: {
        ...where,
        ...(input.cursor
          ? {
              OR: [
                { sortOrder: { gt: input.cursor.order } },
                { sortOrder: input.cursor.order, id: { gt: input.cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      take: input.take + 1,
      select: photoSelect,
    }),
    prisma.galleryPhoto.count({ where }),
  ])
}

export function findPublicPhoto(postId: string, photoId: string) {
  return prisma.galleryPhoto.findFirst({
    where: {
      id: photoId,
      postId,
      status: "PUBLISHED",
      post: { category: "GALLERY", isPublished: true },
    },
    select: photoSelect,
  })
}

export async function findPhotoNavigation(row: PhotoRow) {
  const where = {
    postId: row.postId,
    status: "PUBLISHED" as const,
    post: { category: "GALLERY" as const, isPublished: true },
  }
  const before = {
    OR: [
      { sortOrder: { lt: row.sortOrder } },
      { sortOrder: row.sortOrder, id: { lt: row.id } },
    ],
  }
  const after = {
    OR: [
      { sortOrder: { gt: row.sortOrder } },
      { sortOrder: row.sortOrder, id: { gt: row.id } },
    ],
  }
  const [previous, next, preceding, totalCount] = await Promise.all([
    prisma.galleryPhoto.findFirst({
      where: { ...where, ...before },
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { id: true },
    }),
    prisma.galleryPhoto.findFirst({
      where: { ...where, ...after },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { id: true },
    }),
    prisma.galleryPhoto.count({ where: { ...where, ...before } }),
    prisma.galleryPhoto.count({ where }),
  ])
  return {
    previousId: previous?.id ?? null,
    nextId: next?.id ?? null,
    position: preceding + 1,
    totalCount,
  }
}

export function updatePhoto(
  postId: string,
  id: string,
  data: {
    status?: "PUBLISHED" | "HIDDEN"
    caption?: string | null
    altText?: string | null
  },
) {
  return prisma.galleryPhoto.updateMany({ where: { id, postId }, data })
}

export function updatePhotoStatuses(
  postId: string,
  ids: string[],
  status: "PUBLISHED" | "HIDDEN",
) {
  return prisma.galleryPhoto.updateMany({
    where: { postId, id: { in: ids } },
    data: { status },
  })
}

// 사진 순서 예약과 게시글 삭제를 같은 행 잠금으로 직렬화한다.
async function lockPost(transaction: Prisma.TransactionClient, postId: string) {
  const rows = await transaction.$queryRaw<
    Array<{ id: string }>
  >`SELECT id FROM ${prismaPostTable()} WHERE id = ${postId} AND category = 'GALLERY' FOR UPDATE`
  if (rows.length === 0) throw new Error("행사 게시글을 찾을 수 없습니다.")
}

export function createUploadBatch(input: {
  id: string
  postId: string
  uploadedById: string
  files: Array<{ id: string; name: string; size: number }>
}) {
  return prisma.$transaction(async (transaction) => {
    await lockPost(transaction, input.postId)
    const existing = await transaction.galleryUploadBatch.findUnique({
      where: { id: input.id },
      include: { items: true },
    })
    if (existing) {
      if (
        existing.postId !== input.postId ||
        existing.uploadedById !== input.uploadedById ||
        existing.items.length !== input.files.length ||
        !input.files.every((file) =>
          existing.items.some(
            (item) =>
              item.id === file.id &&
              item.originalName === file.name &&
              item.sizeBytes === file.size,
          ),
        )
      ) {
        throw new Error("업로드 묶음 정보가 일치하지 않습니다.")
      }
      return existing
    }
    const post = await transaction.post.update({
      where: { id: input.postId },
      data: { nextGalleryPhotoOrder: { increment: input.files.length } },
      select: { nextGalleryPhotoOrder: true },
    })
    const startOrder = post.nextGalleryPhotoOrder - input.files.length
    return transaction.galleryUploadBatch.create({
      data: {
        id: input.id,
        postId: input.postId,
        uploadedById: input.uploadedById,
        items: {
          create: input.files.map((file, index) => ({
            id: file.id,
            originalName: file.name,
            sizeBytes: file.size,
            sortOrder: startOrder + index,
          })),
        },
      },
      include: { items: true },
    })
  })
}

export async function findUploadItems(postId: string) {
  await prisma.galleryUploadItem.updateMany({
    where: {
      batch: { postId },
      status: "UPLOADING",
      leaseUntil: { lt: new Date() },
    },
    data: {
      status: "FAILED",
      error: "원본 전송이 중단되었습니다. 파일을 다시 선택해 주세요.",
      leaseToken: null,
      leaseUntil: null,
    },
  })
  // 최근 100개씩 확인하며 완료 이력 전체를 매 폴링마다 내려보내지 않는다.
  const rows = await prisma.galleryUploadItem.findMany({
    where: { batch: { postId } },
    orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
    take: 100,
    select: {
      id: true,
      originalName: true,
      sizeBytes: true,
      originalAssetId: true,
      status: true,
      error: true,
      photoId: true,
    },
  })
  return rows.map(({ originalAssetId, ...item }) => ({
    ...item,
    needsFile: originalAssetId === null,
  }))
}

export function findUploadItem(postId: string, id: string) {
  return prisma.galleryUploadItem.findFirst({
    where: { id, batch: { postId } },
    include: uploadInclude,
  })
}

export async function claimFileUpload(postId: string, id: string) {
  const token = randomUUID()
  const result = await prisma.galleryUploadItem.updateMany({
    where: {
      id,
      batch: { postId },
      originalAssetId: null,
      OR: [
        { status: { in: ["WAITING", "FAILED"] } },
        { status: "UPLOADING", leaseUntil: { lt: new Date() } },
      ],
    },
    data: {
      status: "UPLOADING",
      error: null,
      leaseToken: token,
      leaseUntil: new Date(Date.now() + LEASE_MS),
    },
  })
  return result.count > 0 ? token : null
}

export function createStagedAsset(input: Prisma.FileAssetUncheckedCreateInput) {
  return prisma.fileAsset.create({
    data: { ...input, galleryCleanupPending: true },
  })
}

export function finishFileUpload(
  id: string,
  token: string,
  originalAssetId: string,
) {
  return prisma.galleryUploadItem.updateMany({
    where: { id, status: "UPLOADING", leaseToken: token },
    data: {
      originalAssetId,
      status: "QUEUED",
      leaseToken: null,
      leaseUntil: null,
    },
  })
}

export function failUploadItem(id: string, token: string, error: string) {
  return prisma.galleryUploadItem.updateMany({
    where: {
      id,
      leaseToken: token,
      status: { in: ["UPLOADING", "PROCESSING"] },
    },
    data: {
      status: "FAILED",
      error: error.slice(0, 500),
      leaseToken: null,
      leaseUntil: null,
    },
  })
}

export async function retryUploadItem(postId: string, id: string) {
  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(7264310)`
    const result = await transaction.galleryUploadItem.updateMany({
      where: {
        id,
        batch: { postId },
        OR: [
          { status: "FAILED" },
          {
            status: { in: ["UPLOADING", "PROCESSING"] },
            leaseUntil: { lt: new Date() },
          },
        ],
      },
      data: {
        status: "QUEUED",
        error: null,
        attempts: 0,
        leaseToken: null,
        leaseUntil: null,
      },
    })
    // 원본 전송이 끝나지 않은 작업은 파일을 다시 선택해야 한다.
    await transaction.galleryUploadItem.updateMany({
      where: { id, batch: { postId }, status: "QUEUED", originalAssetId: null },
      data: { status: "WAITING" },
    })
    return result.count
  })
}

// DB 전역에서 변환 작업을 세 개로 제한하고 만료된 lease만 회수한다.
export function claimProcessingItem() {
  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(7264310)`
    const now = new Date()
    await transaction.galleryUploadItem.updateMany({
      where: {
        status: "PROCESSING",
        attempts: { gte: 3 },
        leaseUntil: { lt: now },
      },
      data: {
        status: "FAILED",
        error: "이미지 처리 시간이 초과되었습니다. 다시 시도해 주세요.",
        leaseToken: null,
        leaseUntil: null,
      },
    })
    const active = await transaction.galleryUploadItem.count({
      where: { status: "PROCESSING", leaseUntil: { gt: now } },
    })
    if (active >= 3) return null
    const item = await transaction.galleryUploadItem.findFirst({
      where: {
        originalAssetId: { not: null },
        attempts: { lt: 3 },
        OR: [
          { status: "QUEUED" },
          { status: "PROCESSING", leaseUntil: { lt: now } },
        ],
      },
      orderBy: [{ createdAt: "asc" }, { sortOrder: "asc" }],
      include: uploadInclude,
    })
    if (!item) return null
    return transaction.galleryUploadItem.update({
      where: { id: item.id },
      data: {
        status: "PROCESSING",
        attempts: { increment: 1 },
        leaseToken: randomUUID(),
        leaseUntil: new Date(Date.now() + LEASE_MS),
      },
      include: uploadInclude,
    })
  })
}

// 파생 파일 등록과 완료 상태를 함께 커밋해 재실행 시 사진을 중복 생성하지 않는다.
export function completeProcessingItem(input: {
  item: UploadRow
  displayAssetId: string
  thumbnailAssetId: string
}) {
  return prisma.$transaction(async (transaction) => {
    await lockPost(transaction, input.item.batch.postId)
    const claimed = await transaction.galleryUploadItem.updateMany({
      where: {
        id: input.item.id,
        status: "PROCESSING",
        leaseToken: input.item.leaseToken,
      },
      data: {
        status: "COMPLETED",
        leaseUntil: null,
        leaseToken: null,
        error: null,
      },
    })
    if (!claimed.count || !input.item.originalAsset)
      throw new Error("취소되었거나 다시 시작된 업로드입니다.")
    const photo = await transaction.galleryPhoto.create({
      data: {
        postId: input.item.batch.postId,
        originalAssetId: input.item.originalAsset.id,
        displayAssetId: input.displayAssetId,
        thumbnailAssetId: input.thumbnailAssetId,
        sortOrder: input.item.sortOrder,
        sourceChecksum: input.item.originalAsset.checksum ?? "",
      },
    })
    await transaction.fileAsset.updateMany({
      where: {
        id: {
          in: [
            input.item.originalAsset.id,
            input.displayAssetId,
            input.thumbnailAssetId,
          ],
        },
      },
      data: { galleryCleanupPending: false },
    })
    await transaction.galleryUploadItem.update({
      where: { id: input.item.id },
      data: { photoId: photo.id },
    })
    return photo
  })
}

export function detachPhoto(postId: string, id: string) {
  return prisma.$transaction(async (transaction) => {
    const photo = await transaction.galleryPhoto.findFirst({
      where: { id, postId },
      select: photoSelect,
    })
    if (!photo) return null
    await transaction.fileAsset.updateMany({
      where: {
        id: {
          in: [
            photo.originalAsset.id,
            photo.displayAsset.id,
            photo.thumbnailAsset.id,
          ],
        },
      },
      data: { galleryCleanupPending: true },
    })
    await transaction.galleryUploadItem.updateMany({
      where: { photoId: id },
      data: { status: "CANCELLED" },
    })
    await transaction.galleryPhoto.delete({ where: { id } })
    return photo
  })
}

const unusedGalleryAssetWhere: Prisma.FileAssetWhereInput = {
  galleryCleanupPending: true,
  postUsages: { none: {} },
  archiveOriginalPhoto: { is: null },
  archiveDisplayPhoto: { is: null },
  galleryOriginalPhoto: { is: null },
  galleryDisplayPhoto: { is: null },
  galleryThumbnailPhoto: { is: null },
  NOT: {
    galleryUploadItem: {
      is: { status: { in: ["UPLOADING", "QUEUED", "PROCESSING"] } },
    },
  },
}

export function findGalleryCleanupCandidates(ids?: string[]) {
  return prisma.fileAsset.findMany({
    where: {
      ...unusedGalleryAssetWhere,
      ...(ids
        ? { id: { in: ids } }
        : { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    },
    take: 100,
    orderBy: { createdAt: "asc" },
    select: assetSelect,
  })
}

export function deleteCleanedAsset(id: string) {
  return prisma.fileAsset.deleteMany({
    where: { ...unusedGalleryAssetWhere, id },
  })
}

// 원본 재시도와 정리를 같은 잠금으로 직렬화하고 정리 대상 작업은 취소한다.
export function claimCleanupAsset(id: string) {
  return prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(7264310)`
    const asset = await transaction.fileAsset.findFirst({
      where: { ...unusedGalleryAssetWhere, id },
      select: assetSelect,
    })
    if (!asset) return null
    await transaction.galleryUploadItem.updateMany({
      where: { originalAssetId: id },
      data: { status: "CANCELLED", originalAssetId: null },
    })
    return asset
  })
}
