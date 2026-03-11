import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  createYouthBlogRecord,
  deleteYouthBlogById,
  findYouthBlogById,
  findYouthBlogPage,
  updateYouthBlogById,
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

export async function createYouthBlog(input: {
  title: string
  summary?: string
  content: string
  isPublished?: boolean
  authorId: string
}) {
  const normalizedTitle = input.title.trim()
  const normalizedSummary = input.summary?.trim()
  const normalizedContent = input.content.trim()
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  return createYouthBlogRecord({
    title: normalizedTitle,
    slug: toSlug(normalizedTitle),
    summary: normalizedSummary || undefined,
    content: normalizedContent,
    youtubeUrl,
    isPublished: Boolean(input.isPublished),
    authorId: input.authorId,
  })
}

export async function getYouthBlogPage(params: {
  take?: number
  cursor?: string
  query?: string
  isPublished?: boolean
}) {
  const take = params.take ?? 10
  const items = await findYouthBlogPage({
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

export async function getYouthBlogById(id: string) {
  return findYouthBlogById(id)
}

export async function updateYouthBlog(input: {
  id: string
  title: string
  summary?: string
  content: string
  isPublished?: boolean
}) {
  const normalizedSummary = input.summary?.trim()
  const normalizedContent = input.content.trim()
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  return updateYouthBlogById(input.id, {
    title: input.title.trim(),
    summary: normalizedSummary ? normalizedSummary : null,
    content: normalizedContent,
    youtubeUrl,
    isPublished: Boolean(input.isPublished),
  })
}

export async function removeYouthBlogById(id: string) {
  return deleteYouthBlogById(id)
}
