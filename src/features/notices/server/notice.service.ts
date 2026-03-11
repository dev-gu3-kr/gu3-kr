import {
  countNotices,
  createNoticeRecord,
  deleteNoticeById,
  findNoticeById,
  findNoticePage,
  findNoticePageByOffset,
  findPublishedNoticeById,
  findPublishedNoticeNavigationList,
  updateNoticeById,
} from "./notice.query"

function toSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return `${base || "notice"}-${Date.now()}`
}

type NoticeRow = {
  id: string
  title: string
  summary: string | null
  content: string
  isPublished: boolean
  isPinned: boolean
  createdAt: Date
  author?: { displayName: string } | null
}

function mapNoticeItem<T extends NoticeRow>(item: T) {
  return {
    ...item,
    authorName: item.author?.displayName ?? "관리자",
  }
}

export async function createNotice(input: {
  title: string
  summary?: string
  content: string
  isPublished?: boolean
  isPinned?: boolean
  authorId: string
}) {
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
  const take = params.take ?? 10
  const rows = await findNoticePage({
    take,
    cursor: params.cursor,
    query: params.query,
    isPublished: params.isPublished,
  })

  const items = rows.map(mapNoticeItem)
  const nextCursor = items.length === take ? items[items.length - 1]?.id : null

  return {
    items,
    nextCursor,
  }
}

export async function getNoticeById(id: string) {
  const row = await findNoticeById(id)
  return row ? mapNoticeItem(row) : null
}

export async function updateNotice(input: {
  id: string
  title: string
  summary?: string
  content: string
  isPublished?: boolean
  isPinned?: boolean
}) {
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
  const rows = await findNoticePageByOffset({
    take: params.take,
    skip: params.skip,
    query: params.query,
    isPublished: params.isPublished,
  })

  return rows.map(mapNoticeItem)
}

export async function getPublishedNoticeById(id: string) {
  const row = await findPublishedNoticeById(id)
  return row ? mapNoticeItem(row) : null
}

export async function getPublishedNoticeDetailWithNavigation(id: string) {
  const item = await getPublishedNoticeById(id)
  if (!item) return null

  const ordered = await findPublishedNoticeNavigationList()
  const currentIndex = ordered.findIndex((row) => row.id === id)

  const navigation = {
    prev:
      currentIndex >= 0 && currentIndex < ordered.length - 1
        ? {
            id: ordered[currentIndex + 1].id,
            title: ordered[currentIndex + 1].title,
          }
        : null,
    next:
      currentIndex > 0
        ? {
            id: ordered[currentIndex - 1].id,
            title: ordered[currentIndex - 1].title,
          }
        : null,
  }

  return { item, navigation }
}
