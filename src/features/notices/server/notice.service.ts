import {
  countNotices,
  createNoticeRecord,
  deleteNoticeById,
  findNoticeById,
  findNoticePage,
  findNoticePageByOffset,
  findPublishedNoticeById,
  updateNoticeById,
} from "./notice.query"

function toSlug(title: string) {
  // 제목 기반 슬러그를 생성하고 중복 방지를 위해 timestamp를 덧붙인다.
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return `${base || "notice"}-${Date.now()}`
}

export async function createNotice(input: {
  title: string
  summary?: string
  content: string
  isPublished?: boolean
  isPinned?: boolean
  authorId: string
}) {
  // 공지 작성 입력을 정규화한다.
  const normalizedTitle = input.title.trim()
  const normalizedSummary = input.summary?.trim()
  const normalizedContent = input.content.trim()

  return createNoticeRecord({
    title: normalizedTitle,
    slug: toSlug(normalizedTitle),
    summary: normalizedSummary || undefined,
    content: normalizedContent,
    isPublished: Boolean(input.isPublished),
    isPinned: Boolean(input.isPinned),
    authorId: input.authorId,
  })
}

export async function getNoticePage(params: {
  take?: number
  cursor?: string
  query?: string
  isPublished?: boolean
  isPinned?: boolean
}) {
  // 인피니티 스크롤용 공지 페이지를 반환한다.
  const take = params.take ?? 10
  const items = await findNoticePage({
    take,
    cursor: params.cursor,
    query: params.query,
    isPublished: params.isPublished,
  })

  const nextCursor = items.length === take ? items[items.length - 1]?.id : null

  return {
    items,
    nextCursor,
  }
}

export async function getNoticeById(id: string) {
  // 공지 상세 페이지에서 사용할 단건 공지 데이터를 반환한다.
  return findNoticeById(id)
}

export async function updateNotice(input: {
  id: string
  title: string
  summary?: string
  content: string
  isPublished?: boolean
  isPinned?: boolean
}) {
  // 공지 수정 입력을 정규화해 반영한다.
  const normalizedSummary = input.summary?.trim()

  return updateNoticeById(input.id, {
    title: input.title.trim(),
    summary: normalizedSummary ? normalizedSummary : null,
    content: input.content.trim(),
    isPublished: Boolean(input.isPublished),
    isPinned: Boolean(input.isPinned),
  })
}

export async function removeNoticeById(id: string) {
  // 공지 삭제를 수행한다.
  return deleteNoticeById(id)
}

export async function getNoticeCount(params: {
  query?: string
  isPublished?: boolean
}) {
  return countNotices({
    query: params.query,
    isPublished: params.isPublished,
  })
}

export async function getNoticePageByOffset(params: {
  take: number
  skip: number
  query?: string
  isPublished?: boolean
}) {
  return findNoticePageByOffset({
    take: params.take,
    skip: params.skip,
    query: params.query,
    isPublished: params.isPublished,
  })
}

export async function getPublishedNoticeById(id: string) {
  return findPublishedNoticeById(id)
}
