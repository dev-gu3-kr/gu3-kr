import type { ArchivePhotoStatus, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const archivePhotoSelect = {
  id: true,
  year: true,
  status: true,
  sortOrder: true,
  caption: true,
  altText: true,
  sourcePath: true,
  createdAt: true,
  originalAsset: {
    select: {
      id: true,
      originalName: true,
      sizeBytes: true,
      checksum: true,
    },
  },
  displayAsset: {
    select: {
      id: true,
      url: true,
      width: true,
      height: true,
    },
  },
} satisfies Prisma.ArchivePhotoSelect

export type ArchivePhotoRow = Prisma.ArchivePhotoGetPayload<{
  select: typeof archivePhotoSelect
}>

export function findOriginalAssetByChecksum(checksum: string) {
  return prisma.fileAsset.findFirst({
    where: {
      checksum,
      variant: "ORIGINAL",
      archiveOriginalPhoto: { isNot: null },
    },
    select: { id: true, originalName: true },
  })
}

export async function createArchivePhotoRecord(input: {
  id: string
  year: number
  sourcePath?: string
  uploadedById: string
  original: {
    bucket: string
    objectKey: string
    url: string
    originalName: string
    mimeType: string
    sizeBytes: number
    width: number
    height: number
    checksum: string
  }
  display: {
    bucket: string
    objectKey: string
    url: string
    originalName: string
    mimeType: string
    sizeBytes: number
    width: number
    height: number
    checksum: string
  }
}) {
  return prisma.$transaction(async (transaction) => {
    const last = await transaction.archivePhoto.findFirst({
      where: { year: input.year },
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { sortOrder: true },
    })

    const originalAsset = await transaction.fileAsset.create({
      data: {
        ...input.original,
        variant: "ORIGINAL",
        uploadedById: input.uploadedById,
      },
      select: { id: true },
    })
    const displayAsset = await transaction.fileAsset.create({
      data: {
        ...input.display,
        variant: "DISPLAY",
        uploadedById: input.uploadedById,
      },
      select: { id: true },
    })

    return transaction.archivePhoto.create({
      data: {
        id: input.id,
        year: input.year,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        sourcePath: input.sourcePath,
        uploadedById: input.uploadedById,
        originalAssetId: originalAsset.id,
        displayAssetId: displayAsset.id,
      },
      select: archivePhotoSelect,
    })
  })
}

export function findAdminArchivePhotoPage(input: {
  take: number
  cursor?: string
  year?: number
  status?: ArchivePhotoStatus
}) {
  return prisma.archivePhoto.findMany({
    where: {
      ...(input.year ? { year: input.year } : {}),
      ...(input.status ? { status: input.status } : {}),
    },
    orderBy: [{ year: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
    take: input.take + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    select: archivePhotoSelect,
  })
}

export function findPublicArchivePhotoPage(input: {
  take: number
  cursor?: string
  year?: number
}) {
  return prisma.archivePhoto.findMany({
    where: {
      status: "PUBLISHED",
      ...(input.year ? { year: input.year } : {}),
    },
    orderBy: [{ year: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
    take: input.take + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    select: archivePhotoSelect,
  })
}

export async function findArchiveYears(options: { publishedOnly: boolean }) {
  const rows = await prisma.archivePhoto.findMany({
    where: {
      ...(options.publishedOnly ? { status: "PUBLISHED" as const } : {}),
    },
    distinct: ["year"],
    orderBy: { year: "desc" },
    select: { year: true },
  })
  return rows.map((row) => row.year)
}

export function findArchivePhotoById(id: string) {
  return prisma.archivePhoto.findUnique({
    where: { id },
    select: archivePhotoSelect,
  })
}

export function findPublicArchivePhotoById(id: string) {
  return prisma.archivePhoto.findFirst({
    where: { id, status: "PUBLISHED" },
    select: archivePhotoSelect,
  })
}

export async function deleteArchivePhotoRecord(id: string) {
  return prisma.$transaction(async (transaction) => {
    const target = await transaction.archivePhoto.findUnique({
      where: { id },
      select: {
        id: true,
        originalAsset: {
          select: { id: true, bucket: true, objectKey: true },
        },
        displayAsset: {
          select: { id: true, bucket: true, objectKey: true },
        },
      },
    })
    if (!target) return null

    await transaction.archivePhoto.delete({ where: { id } })
    return target
  })
}

export function deleteDetachedArchiveAssets(ids: string[]) {
  return prisma.fileAsset.deleteMany({
    where: {
      id: { in: ids },
      variant: { in: ["ORIGINAL", "DISPLAY"] },
      archiveOriginalPhoto: { is: null },
      archiveDisplayPhoto: { is: null },
    },
  })
}

export async function updateArchivePhotoRecord(input: {
  id: string
  changedById: string
  year?: number
  status?: ArchivePhotoStatus
  caption?: string | null
  altText?: string | null
}) {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.archivePhoto.findUnique({
      where: { id: input.id },
      select: { id: true, year: true },
    })
    if (!current) return null

    let sortOrder: number | undefined
    if (input.year !== undefined && input.year !== current.year) {
      const last = await transaction.archivePhoto.findFirst({
        where: { year: input.year },
        orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
        select: { sortOrder: true },
      })
      sortOrder = (last?.sortOrder ?? -1) + 1
      await transaction.archivePhotoYearHistory.create({
        data: {
          photoId: current.id,
          fromYear: current.year,
          toYear: input.year,
          changedById: input.changedById,
        },
      })
    }

    return transaction.archivePhoto.update({
      where: { id: input.id },
      data: {
        ...(input.year !== undefined ? { year: input.year } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.caption !== undefined ? { caption: input.caption } : {}),
        ...(input.altText !== undefined ? { altText: input.altText } : {}),
      },
      select: archivePhotoSelect,
    })
  })
}

export async function bulkUpdateArchivePhotos(input: {
  ids: string[]
  action: "CHANGE_STATUS" | "CHANGE_YEAR"
  changedById: string
  year?: number
  status?: ArchivePhotoStatus
}) {
  return prisma.$transaction(async (transaction) => {
    const rows = await transaction.archivePhoto.findMany({
      where: { id: { in: input.ids } },
      orderBy: [{ year: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
      select: { id: true, year: true },
    })
    if (rows.length === 0) return 0

    if (input.action === "CHANGE_YEAR" && input.year !== undefined) {
      const last = await transaction.archivePhoto.findFirst({
        where: { year: input.year },
        orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
        select: { sortOrder: true },
      })
      const startOrder = (last?.sortOrder ?? -1) + 1

      for (const [index, row] of rows.entries()) {
        await transaction.archivePhoto.update({
          where: { id: row.id },
          data: { year: input.year, sortOrder: startOrder + index },
        })
        if (row.year !== input.year) {
          await transaction.archivePhotoYearHistory.create({
            data: {
              photoId: row.id,
              fromYear: row.year,
              toYear: input.year,
              changedById: input.changedById,
            },
          })
        }
      }
      return rows.length
    }

    if (input.action !== "CHANGE_STATUS" || input.status === undefined) return 0

    const result = await transaction.archivePhoto.updateMany({
      where: { id: { in: rows.map((row) => row.id) } },
      data: { status: input.status },
    })
    return result.count
  })
}
