import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  getIntroPostSectionConfig,
  type IntroPostSectionKey,
} from "../isomorphic/intro-posts.types"
import {
  createIntroPostRecord,
  deleteIntroPostById,
  deletePostAssetById,
  findIntroPostById,
  findIntroPostDeleteTargetById,
  findIntroPosts,
  findIntroPostTargetById,
  replaceIntroPostRecord,
} from "./intro-posts.query"

type PostImageRecord = {
  url: string
}

type IntroPostListRow = {
  id: string
  title: string
  content: string
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  fileUsages: Array<{ asset: { url: string } }>
}

type IntroPostDetailRow = {
  id: string
  title: string
  content: string
  sortOrder: number
  isPublished: boolean
  createdAt: Date
  fileUsages: Array<{ id: string; asset: { url: string } }>
}

function mapIntroPostListItem<T extends IntroPostListRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.fileUsages[0]?.asset.url ?? null,
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
    imageUrl: item.fileUsages[0]?.asset.url ?? null,
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

  const old = target.fileUsages[0]

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
    oldImageUrl: input.replaceImage ? (old?.asset.url ?? null) : null,
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
    imageUrls: target.fileUsages.map((usage) => usage.asset.url),
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

  const old = target.fileUsages[0]

  if (!old) {
    return {
      oldImageUrl: null,
    }
  }

  await deletePostAssetById(old.id)

  return {
    oldImageUrl: old.asset.url,
    oldImageAssetId: old.asset.id,
  }
}
