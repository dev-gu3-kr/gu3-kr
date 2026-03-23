import { createTimestampSlug } from "@/lib/admin/slug"
import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  countPublishedGalleries,
  createGalleryRecord,
  deleteGalleryById,
  deleteGalleryImageById,
  findGalleryDeleteTargetById,
  findGalleryDetailById,
  findGalleryPageRows,
  findGalleryTargetById,
  findPublishedGalleryById,
  findPublishedGalleryNavigationList,
  findPublishedGalleryPageByOffset,
  replaceGalleryRecord,
} from "./gallery.query"

type GalleryImageRecord = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  isCover: boolean
  sortOrder: number
}

type GalleryListRow = {
  id: string
  title: string
  isPublished: boolean
  createdAt: Date
  youtubeUrl: string | null
  galleryImages: Array<{ url: string }>
}

type GalleryDetailRow = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: Date
  youtubeUrl: string | null
  galleryImages: Array<{ id: string; originalName: string; url: string }>
}

function mapGalleryListItem<T extends GalleryListRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
    thumbnailUrl: item.galleryImages[0]?.url ?? null,
    hasYoutube: Boolean(item.youtubeUrl),
  }
}

function mapGalleryDetail<T extends GalleryDetailRow>(item: T) {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    isPublished: item.isPublished,
    createdAt: item.createdAt,
    galleryImages: item.galleryImages,
    youtubeUrl: item.youtubeUrl ?? null,
    hasYoutube: Boolean(item.youtubeUrl),
  }
}

export async function getGalleryPage(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
}) {
  const rows = await findGalleryPageRows(params)
  const hasMore = rows.length > params.take
  const items = (hasMore ? rows.slice(0, params.take) : rows).map(
    mapGalleryListItem,
  )

  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
    },
  }
}

export async function getGalleryById(id: string) {
  const row = await findGalleryDetailById(id)
  return row ? mapGalleryDetail(row) : null
}

export async function createGallery(input: {
  title: string
  content: string
  isPublished: boolean
  authorId: string
  imageRecord: GalleryImageRecord
}) {
  const normalizedTitle = input.title.trim()
  const normalizedContent = input.content.trim()

  return createGalleryRecord({
    title: normalizedTitle,
    slug: createTimestampSlug(normalizedTitle, "gallery"),
    content: normalizedContent,
    youtubeUrl: extractFirstYoutubeUrl(normalizedContent),
    isPublished: input.isPublished,
    authorId: input.authorId,
    imageRecord: input.imageRecord,
  })
}

export async function updateGallery(input: {
  id: string
  title: string
  content: string
  isPublished: boolean
  replaceImage?: GalleryImageRecord
}) {
  const target = await findGalleryTargetById(input.id)
  if (!target) return null

  const old = target.galleryImages[0]
  if (input.replaceImage && old) {
    await deleteGalleryImageById(old.id)
  }

  const normalizedContent = input.content.trim()

  await replaceGalleryRecord({
    id: input.id,
    title: input.title.trim(),
    content: normalizedContent,
    youtubeUrl: extractFirstYoutubeUrl(normalizedContent),
    isPublished: input.isPublished,
    replaceImage: input.replaceImage,
  })

  return {
    oldImageUrl: input.replaceImage ? (old?.url ?? null) : null,
  }
}

export async function removeGallery(id: string) {
  const target = await findGalleryDeleteTargetById(id)
  if (!target) return null

  await deleteGalleryById(id)

  return {
    imageUrls: target.galleryImages.map((image) => image.url),
  }
}

export async function getPublicGalleryCount(query?: string) {
  return countPublishedGalleries(query)
}

export async function getPublicGalleryPageByOffset(params: {
  take: number
  skip: number
  query?: string
}) {
  const rows = await findPublishedGalleryPageByOffset(params)

  return rows.map(mapGalleryListItem)
}

export async function getPublishedGalleryById(id: string) {
  const row = await findPublishedGalleryById(id)
  return row ? mapGalleryDetail(row) : null
}

export async function getPublishedGalleryDetailWithNavigation(id: string) {
  const item = await getPublishedGalleryById(id)
  if (!item) return null

  const ordered = await findPublishedGalleryNavigationList()
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
