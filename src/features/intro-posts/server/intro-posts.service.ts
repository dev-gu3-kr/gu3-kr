import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  getIntroPostSectionConfig,
  type IntroPostSectionKey,
} from "../isomorphic/intro-posts.types"
import {
  createIntroPostRecord,
  deleteIntroPostById,
  deletePostImageById,
  findIntroPostById,
  findIntroPostDeleteTargetById,
  findIntroPosts,
  findIntroPostTargetById,
  replaceIntroPostRecord,
} from "./intro-posts.query"

type PostImageRecord = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  isCover: boolean
  sortOrder: number
}

type IntroPostListRow = {
  id: string
  title: string
  content: string
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  postImages: Array<{ url: string }>
}

type IntroPostDetailRow = {
  id: string
  title: string
  content: string
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  postImages: Array<{ id: string; url: string }>
}

function mapIntroPostListItem<T extends IntroPostListRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.postImages[0]?.url ?? null,
    content: item.content,
    sortOrder: item.sortOrder,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
  }
}

function mapIntroPostDetail<T extends IntroPostDetailRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.postImages[0]?.url ?? null,
    content: item.content,
    sortOrder: item.sortOrder,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
  }
}

function toSlug(section: IntroPostSectionKey, title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  const fallback = section === "community" ? "community-about" : "youth-about"

  return `${base || fallback}-${Date.now()}`
}

export async function createIntroPost(input: {
  section: IntroPostSectionKey
  title: string
  content: string
  sortOrder?: number
  isPublished?: boolean
  authorId: string
  imageRecord: PostImageRecord
}) {
  const config = getIntroPostSectionConfig(input.section)
  const normalizedTitle = input.title.trim()
  const normalizedContent = input.content.trim()
  const normalizedSortOrder = input.sortOrder ?? 0
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  return createIntroPostRecord({
    category: config.category,
    title: normalizedTitle,
    slug: toSlug(input.section, normalizedTitle),
    content: normalizedContent,
    youtubeUrl,
    sortOrder: normalizedSortOrder,
    isPublished: Boolean(input.isPublished),
    authorId: input.authorId,
    imageRecord: input.imageRecord,
  })
}

export async function getIntroPosts(params: {
  section: IntroPostSectionKey
  isPublished?: boolean
}) {
  const config = getIntroPostSectionConfig(params.section)
  const rows = await findIntroPosts({
    category: config.category,
    isPublished: params.isPublished,
  })

  return rows.map(mapIntroPostListItem)
}

export async function getIntroPostById(
  section: IntroPostSectionKey,
  id: string,
) {
  const config = getIntroPostSectionConfig(section)
  const row = await findIntroPostById({
    category: config.category,
    id,
  })

  return row ? mapIntroPostDetail(row) : null
}

export async function updateIntroPost(input: {
  section: IntroPostSectionKey
  id: string
  title: string
  content: string
  sortOrder?: number
  isPublished?: boolean
  replaceImage?: PostImageRecord
}) {
  const config = getIntroPostSectionConfig(input.section)
  const target = await findIntroPostTargetById({
    category: config.category,
    id: input.id,
  })

  if (!target) return null

  const old = target.postImages[0]

  if (input.replaceImage && old) {
    await deletePostImageById(old.id)
  }

  const normalizedContent = input.content.trim()
  const normalizedSortOrder = input.sortOrder ?? 0
  const youtubeUrl = extractFirstYoutubeUrl(normalizedContent)

  await replaceIntroPostRecord({
    id: input.id,
    title: input.title.trim(),
    content: normalizedContent,
    youtubeUrl,
    sortOrder: normalizedSortOrder,
    isPublished: Boolean(input.isPublished),
    replaceImage: input.replaceImage,
  })

  return {
    oldImageUrl: input.replaceImage ? (old?.url ?? null) : null,
  }
}

export async function removeIntroPostById(
  section: IntroPostSectionKey,
  id: string,
) {
  const config = getIntroPostSectionConfig(section)
  const target = await findIntroPostDeleteTargetById({
    category: config.category,
    id,
  })

  if (!target) return null

  await deleteIntroPostById(id)

  return {
    imageUrls: target.postImages.map((image) => image.url),
  }
}

export async function removeIntroPostImage(
  section: IntroPostSectionKey,
  id: string,
) {
  const config = getIntroPostSectionConfig(section)
  const target = await findIntroPostTargetById({
    category: config.category,
    id,
  })

  if (!target) return null

  const old = target.postImages[0]

  if (!old) {
    return {
      oldImageUrl: null,
    }
  }

  await deletePostImageById(old.id)

  return {
    oldImageUrl: old.url,
  }
}
