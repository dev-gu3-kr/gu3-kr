import { prisma } from "@/lib/prisma"

type PostImageRecord = {
  url: string
}

export async function findGalleryPageRows(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
}) {
  return prisma.post.findMany({
    where: {
      category: "GALLERY",
      ...(params.query ? { title: { contains: params.query } } : {}),
      ...(params.status === "published"
        ? { isPublished: true }
        : params.status === "draft"
          ? { isPublished: false }
          : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
      youtubeUrl: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function findGalleryDetailById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      youtubeUrl: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          id: true,
          asset: { select: { originalName: true, url: true } },
        },
      },
    },
  })
}

export async function findGalleryTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: {
      id: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { id: true, asset: { select: { url: true } } },
      },
    },
  })
}

export async function createGalleryRecord(params: {
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  authorId: string
  imageRecord: PostImageRecord
}) {
  return prisma.post.create({
    data: {
      category: "GALLERY",
      title: params.title,
      slug: params.slug,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      authorId: params.authorId,
      fileUsages: {
        create: {
          role: "COVER",
          asset: { connect: { url: params.imageRecord.url } },
        },
      },
    },
    select: { id: true },
  })
}

export async function replaceGalleryRecord(params: {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  replaceImage?: PostImageRecord
}) {
  return prisma.post.update({
    where: { id: params.id },
    data: {
      title: params.title,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      ...(params.replaceImage
        ? {
            fileUsages: {
              create: {
                role: "COVER",
                asset: { connect: { url: params.replaceImage.url } },
              },
            },
          }
        : {}),
    },
  })
}

export async function findGalleryDeleteTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "GALLERY" },
    select: {
      id: true,
      fileUsages: {
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function deleteGalleryById(id: string) {
  return prisma.post.delete({ where: { id } })
}

export async function countPublishedGalleries(query?: string) {
  return prisma.post.count({
    where: {
      category: "GALLERY",
      isPublished: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : {}),
    },
  })
}

export async function findPublishedGalleryPageByOffset(params: {
  take: number
  skip: number
  query?: string
}) {
  return prisma.post.findMany({
    where: {
      category: "GALLERY",
      isPublished: true,
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take,
    skip: params.skip,
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
      youtubeUrl: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function findPublishedGalleryById(id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      category: "GALLERY",
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      youtubeUrl: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          id: true,
          asset: { select: { originalName: true, url: true } },
        },
      },
    },
  })
}

export async function findPublishedGalleryNavigationList() {
  return prisma.post.findMany({
    where: {
      category: "GALLERY",
      isPublished: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
    },
  })
}
