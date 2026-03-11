import { createTimestampSlug } from "@/lib/admin/slug"
import { extractFirstYoutubeUrl } from "@/lib/youtube"
import {
  createBulletinRecord,
  deleteAttachmentById,
  deleteBulletinById,
  findBulletinById,
  findBulletinDeleteTargetById,
  findBulletinPageRows,
  findBulletinTargetById,
  updateBulletinRecord,
} from "./bulletin.query"

type AttachmentRecord = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
}

export async function getBulletinPage(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
}) {
  const rows = await findBulletinPageRows(params)
  const hasMore = rows.length > params.take
  const items = hasMore ? rows.slice(0, params.take) : rows

  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      take: params.take,
    },
  }
}

export async function getBulletinById(id: string) {
  return findBulletinById(id)
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

  const oldAttachment = target.attachments[0]
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
    oldAttachmentUrl: input.newAttachment ? (oldAttachment?.url ?? null) : null,
  }
}

export async function removeBulletin(id: string) {
  const target = await findBulletinDeleteTargetById(id)
  if (!target) return null

  await deleteBulletinById(id)

  return {
    attachmentUrls: target.attachments.map((attachment) => attachment.url),
  }
}
