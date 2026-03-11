import { prisma } from "@/lib/prisma"

export async function createNoticeRecord(params: {
  title: string
  slug: string
  summary?: string
  content: string
  isPublished: boolean
  isPinned: boolean
  authorId: string
}) {
  return prisma.post.create({
    data: {
      category: "NOTICE",
      title: params.title,
      slug: params.slug,
      summary: params.summary,
      content: params.content,
      isPublished: params.isPublished,
      isPinned: params.isPinned,
      publishedAt: params.isPublished ? new Date() : null,
      authorId: params.authorId,
    },
  })
}

export async function findNoticePage(params: {
  take: number
  cursor?: string
  query?: string
  isPublished?: boolean
}) {
  return prisma.post.findMany({
    where: {
      category: "NOTICE",
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }, { id: "desc" }],
    take: params.take,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      isPublished: true,
      isPinned: true,
      createdAt: true,
      author: { select: { displayName: true } },
    },
  })
}

export async function findNoticeById(id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      category: "NOTICE",
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      isPublished: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { displayName: true } },
    },
  })
}

export async function updateNoticeById(
  id: string,
  params: {
    title: string
    summary?: string | null
    content: string
    isPublished: boolean
    isPinned: boolean
  },
) {
  return prisma.post.update({
    where: { id },
    data: {
      title: params.title,
      summary: params.summary,
      content: params.content,
      isPublished: params.isPublished,
      isPinned: params.isPinned,
      publishedAt: params.isPublished ? new Date() : null,
    },
  })
}

export async function deleteNoticeById(id: string) {
  return prisma.post.delete({
    where: { id },
  })
}

export async function countNotices(params: {
  query?: string
  isPublished?: boolean
}) {
  return prisma.post.count({
    where: {
      category: "NOTICE",
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { summary: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
  })
}

export async function findNoticePageByOffset(params: {
  take: number
  skip: number
  query?: string
  isPublished?: boolean
}) {
  return prisma.post.findMany({
    where: {
      category: "NOTICE",
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { summary: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
    take: params.take,
    skip: params.skip,
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      isPublished: true,
      isPinned: true,
      createdAt: true,
      author: { select: { displayName: true } },
    },
  })
}

export async function findPublishedNoticeById(id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      category: "NOTICE",
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      isPublished: true,
      isPinned: true,
      createdAt: true,
      author: { select: { displayName: true } },
    },
  })
}

export async function findPublishedNoticeNavigationList() {
  return prisma.post.findMany({
    where: {
      category: "NOTICE",
      isPublished: true,
    },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
    },
  })
}
