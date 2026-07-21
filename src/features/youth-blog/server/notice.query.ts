import { prisma } from "@/lib/prisma"

type PostImageRecord = {
  url: string
}

export async function createYouthBlogRecord(params: {
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  authorId: string
  imageRecord: PostImageRecord
}) {
  // 청소년 블로그 레코드를 생성한다.
  return prisma.post.create({
    data: {
      category: "YOUTH_BLOG",
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

export async function findYouthBlogPage(params: {
  take: number
  cursor?: string
  query?: string
  isPublished?: boolean
}) {
  // 청소년 블로그 목록 페이지를 최신순으로 조회한다.
  return prisma.post.findMany({
    where: {
      category: "YOUTH_BLOG",
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
    orderBy: {
      createdAt: "desc",
    },
    take: params.take + 1,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor },
          skip: 1,
        }
      : {}),
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function findYouthBlogById(id: string) {
  // 청소년 블로그 상세를 ID로 조회한다.
  return prisma.post.findFirst({
    where: {
      id,
      category: "YOUTH_BLOG",
    },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
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

export async function findYouthBlogTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "YOUTH_BLOG" },
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

export async function replaceYouthBlogRecord(params: {
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

export async function findYouthBlogDeleteTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "YOUTH_BLOG" },
    select: {
      id: true,
      fileUsages: {
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function deleteYouthBlogById(id: string) {
  // 청소년 블로그를 ID 기준으로 삭제한다.
  return prisma.post.delete({
    where: { id },
  })
}

export async function countPublishedYouthBlogs(query?: string) {
  return prisma.post.count({
    where: {
      category: "YOUTH_BLOG",
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

export async function findPublishedYouthBlogPageByOffset(params: {
  take: number
  skip: number
  query?: string
}) {
  return prisma.post.findMany({
    where: {
      category: "YOUTH_BLOG",
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
      content: true,
      isPublished: true,
      createdAt: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function findPublishedYouthBlogById(id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      category: "YOUTH_BLOG",
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
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

export async function findPublishedYouthBlogNavigationList() {
  return prisma.post.findMany({
    where: {
      category: "YOUTH_BLOG",
      isPublished: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
    },
  })
}
