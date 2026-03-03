import { prisma } from "@/lib/prisma"

export async function createNoticeRecord(params: {
  title: string
  slug: string
  summary?: string
  content: string
  isPublished: boolean
  authorId: string
}) {
  // 공지 게시글 레코드를 생성한다.
  return prisma.post.create({
    data: {
      category: "NOTICE",
      title: params.title,
      slug: params.slug,
      summary: params.summary,
      content: params.content,
      isPublished: params.isPublished,
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
  // 공지 목록 페이지를 최신순으로 조회한다(cursor 기반 페이지네이션).
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
    orderBy: {
      createdAt: "desc",
    },
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
      createdAt: true,
    },
  })
}

export async function findNoticeById(id: string) {
  // 공지 상세를 ID로 조회한다.
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
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function updateNoticeById(
  id: string,
  params: {
    title: string
    summary?: string
    content: string
    isPublished: boolean
  },
) {
  // 공지 ID 기준으로 게시글을 수정한다.
  return prisma.post.update({
    where: { id },
    data: {
      title: params.title,
      summary: params.summary,
      content: params.content,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
    },
  })
}

export async function deleteNoticeById(id: string) {
  // 공지 ID 기준으로 게시글을 삭제한다.
  return prisma.post.delete({
    where: { id },
  })
}
