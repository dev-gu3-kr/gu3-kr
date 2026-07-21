import { createTimestampSlug } from "@/lib/admin/slug"
import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  countBulletins,
  createBulletinRecord,
  deleteAttachmentById,
  deleteBulletinById,
  findBulletinById,
  findBulletinDeleteTargetById,
  findBulletinPageByOffset,
  findBulletinPageRows,
  findBulletinTargetById,
  findPublishedBulletinById,
  findPublishedBulletinNavigationList,
  updateBulletinRecord,
} from "./bulletin.query"

type AttachmentRecord = {
  bucket: string
  objectKey: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  uploadedById: string
}

type BulletinPublicRow = {
  id: string
  title: string
  createdAt: Date
  author?: { displayName: string } | null
  fileUsages: Array<{
    asset: { originalName: string; url: string }
  }>
}

function mapBulletinAdminListItem<T extends BulletinPublicRow>(item: T) {
  const { fileUsages, ...rest } = item

  return {
    ...rest,
    attachments: fileUsages.map((usage) => usage.asset),
  }
}

function mapBulletinPublicItem<T extends BulletinPublicRow>(item: T) {
  const { fileUsages, ...rest } = item

  return {
    ...rest,
    attachments: fileUsages.map((usage) => usage.asset),
    authorName: item.author?.displayName ?? "관리자",
  }
}

export async function getBulletinPage(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
}) {
  const rows = await findBulletinPageRows(params)
  const hasMore = rows.length > params.take
  const pageRows = hasMore ? rows.slice(0, params.take) : rows
  const items = pageRows.map(mapBulletinAdminListItem)

  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? pageRows[pageRows.length - 1]?.id : null,
      take: params.take,
    },
  }
}

export async function getBulletinById(id: string) {
  const item = await findBulletinById(id)
  if (!item) return null

  const { fileUsages, ...rest } = item
  return {
    ...rest,
    attachments: fileUsages.map((usage) => ({
      id: usage.id,
      ...usage.asset,
    })),
  }
}

export async function getBulletinCount(params: {
  query?: string
  isPublished?: boolean
}) {
  return countBulletins(params)
}

export async function getBulletinPageByOffset(params: {
  take: number
  skip: number
  query?: string
  isPublished?: boolean
}) {
  const rows = await findBulletinPageByOffset(params)
  return rows.map(mapBulletinPublicItem)
}

export async function getPublishedBulletinById(id: string) {
  const row = await findPublishedBulletinById(id)
  return row ? mapBulletinPublicItem(row) : null
}

export async function getPublishedBulletinDetailWithNavigation(id: string) {
  const item = await getPublishedBulletinById(id)
  if (!item) return null

  const ordered = await findPublishedBulletinNavigationList()
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

export async function createBulletin(input: {
  title: string
  content: string
  isPublished: boolean
  authorId: string
  attachment: AttachmentRecord
}) {
  const normalizedTitle = input.title.trim()
  const normalizedContent = input.content.trim()

  return createBulletinRecord({
    title: normalizedTitle,
    slug: createTimestampSlug(normalizedTitle, "bulletin"),
    content: normalizedContent,
    youtubeUrl: extractFirstYoutubeUrl(normalizedContent),
    isPublished: input.isPublished,
    authorId: input.authorId,
    attachment: input.attachment,
  })
}

export async function updateBulletin(input: {
  id: string
  title: string
  content: string
  isPublished: boolean
  newAttachment?: AttachmentRecord
}) {
  const target = await findBulletinTargetById(input.id)
  if (!target) return null

  const oldAttachment = target.fileUsages[0]
  if (input.newAttachment && oldAttachment) {
    await deleteAttachmentById(oldAttachment.id)
  }

  const normalizedTitle = input.title.trim()
  const normalizedContent = input.content.trim()

  await updateBulletinRecord({
    id: input.id,
    title: normalizedTitle,
    slug: createTimestampSlug(normalizedTitle, "bulletin"),
    content: normalizedContent,
    youtubeUrl: extractFirstYoutubeUrl(normalizedContent),
    isPublished: input.isPublished,
    newAttachment: input.newAttachment,
  })

  return {
    oldAttachmentUrl: input.newAttachment
      ? (oldAttachment?.asset.url ?? null)
      : null,
    oldAttachmentAssetId: input.newAttachment
      ? (oldAttachment?.asset.id ?? null)
      : null,
  }
}

export async function removeBulletin(id: string) {
  const target = await findBulletinDeleteTargetById(id)
  if (!target) return null

  await deleteBulletinById(id)

  return {
    attachmentUrls: target.fileUsages.map((usage) => usage.asset.url),
    attachmentAssetIds: target.fileUsages.map((usage) => usage.asset.id),
  }
}
