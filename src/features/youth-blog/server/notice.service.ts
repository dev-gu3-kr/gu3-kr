import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  countPublishedYouthBlogs,
  createYouthBlogRecord,
  deleteYouthBlogById,
  findPublishedYouthBlogById,
  findPublishedYouthBlogNavigationList,
  findPublishedYouthBlogPageByOffset,
  findYouthBlogById,
  findYouthBlogDeleteTargetById,
  findYouthBlogPage,
  findYouthBlogTargetById,
  replaceYouthBlogRecord,
} from "./notice.query"

type PostImageRecord = {
  url: string
}

type YouthBlogListRow = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: Date
  fileUsages: Array<{ asset: { url: string } }>
}

type YouthBlogDetailRow = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: Date
  fileUsages: Array<{
    id: string
    asset: { originalName: string; url: string }
  }>
}

function mapYouthBlogListItem<T extends YouthBlogListRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    thumbnailUrl: item.fileUsages[0]?.asset.url ?? null,
    content: item.content,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
  }
}

function mapYouthBlogDetail<T extends YouthBlogDetailRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    thumbnailUrl: item.fileUsages[0]?.asset.url ?? null,
    content: item.content,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
  }
}

function toSlug(title: string) {
  // 제목 기반 슬러그를 생성하고 중복 방지를 위해 timestamp를 덧붙인다.
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return `${base || "youth-blog"}-${Date.now()}`
}

export async function createYouthBlog(input: {
  title: string
  content: string
  isPublished?: boolean
  authorId: string
  imageRecord: PostImageRecord
}) {
  const normalizedTitle = input.title.trim()
  const normalizedContent = input.content.trim()
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  return createYouthBlogRecord({
    title: normalizedTitle,
    slug: toSlug(normalizedTitle),
    content: normalizedContent,
    youtubeUrl,
    isPublished: Boolean(input.isPublished),
    authorId: input.authorId,
    imageRecord: input.imageRecord,
  })
}

export async function getYouthBlogPage(params: {
  take?: number
  cursor?: string
  query?: string
  isPublished?: boolean
}) {
  const take = params.take ?? 10
  const rows = await findYouthBlogPage({
    take,
    cursor: params.cursor,
    query: params.query,
    isPublished: params.isPublished,
  })

  const hasMore = rows.length > take
  const items = (hasMore ? rows.slice(0, take) : rows).map(mapYouthBlogListItem)

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
  }
}

export async function getYouthBlogById(id: string) {
  const row = await findYouthBlogById(id)
  return row ? mapYouthBlogDetail(row) : null
}

export async function updateYouthBlog(input: {
  id: string
  title: string
  content: string
  isPublished?: boolean
  replaceImage?: PostImageRecord
}) {
  const target = await findYouthBlogTargetById(input.id)
  if (!target) return null

  const old = target.fileUsages[0]

  const normalizedContent = input.content.trim()
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  await replaceYouthBlogRecord({
    id: input.id,
    title: input.title.trim(),
    content: normalizedContent,
    youtubeUrl,
    isPublished: Boolean(input.isPublished),
    replaceImage: input.replaceImage,
  })

  return {
    oldImageUrl: input.replaceImage ? (old?.asset.url ?? null) : null,
  }
}

export async function removeYouthBlogById(id: string) {
  const target = await findYouthBlogDeleteTargetById(id)
  if (!target) return null

  await deleteYouthBlogById(id)

  return {
    imageUrls: target.fileUsages.map((usage) => usage.asset.url),
  }
}

export async function getPublicYouthBlogCount(query?: string) {
  return countPublishedYouthBlogs(query)
}

export async function getPublicYouthBlogPageByOffset(params: {
  take: number
  skip: number
  query?: string
}) {
  const rows = await findPublishedYouthBlogPageByOffset(params)

  return rows.map(mapYouthBlogListItem)
}

export async function getPublishedYouthBlogById(id: string) {
  const row = await findPublishedYouthBlogById(id)
  return row ? mapYouthBlogDetail(row) : null
}

export async function getPublishedYouthBlogDetailWithNavigation(id: string) {
  const item = await getPublishedYouthBlogById(id)
  if (!item) return null

  const ordered = await findPublishedYouthBlogNavigationList()
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
