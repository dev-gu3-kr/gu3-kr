import { prisma } from "@/lib/prisma"

type AttachmentRecord = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
}

export async function findBulletinPageRows(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
}) {
  return prisma.post.findMany({
    where: {
      category: "BULLETIN",
      ...(params.query ? { title: { contains: params.query } } : {}),
      ...(params.status === "published"
        ? { isPublished: true }
        : params.status === "draft"
          ? { isPublished: false }
          : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      isPublished: true,
      createdAt: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { url: true, originalName: true },
      },
    },
  })
}

export async function findBulletinById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, originalName: true, url: true },
      },
    },
  })
}

export async function findBulletinTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, url: true },
      },
    },
  })
}

export async function createBulletinRecord(params: {
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  authorId: string
  attachment: AttachmentRecord
}) {
  return prisma.post.create({
    data: {
      category: "BULLETIN",
      title: params.title,
      slug: params.slug,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      authorId: params.authorId,
      attachments: { create: params.attachment },
    },
    select: { id: true },
  })
}

export async function updateBulletinRecord(params: {
  id: string
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  newAttachment?: AttachmentRecord
}) {
  return prisma.post.update({
    where: { id: params.id },
    data: {
      title: params.title,
      slug: params.slug,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      ...(params.newAttachment
        ? { attachments: { create: params.newAttachment } }
        : {}),
    },
  })
}

export async function deleteAttachmentById(id: string) {
  return prisma.attachment.delete({ where: { id } })
}

export async function findBulletinDeleteTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: { id: true, attachments: { select: { id: true, url: true } } },
  })
}

export async function deleteBulletinById(id: string) {
  return prisma.post.delete({ where: { id } })
}
