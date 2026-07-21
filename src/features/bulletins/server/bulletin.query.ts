import { prisma } from "@/lib/prisma"

type AttachmentRecord = {
  bucket: string
  objectKey: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  uploadedById: string
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
      fileUsages: {
        where: { role: "ATTACHMENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { asset: { select: { url: true, originalName: true } } },
      },
    },
  })
}

export async function countBulletins(params: {
  query?: string
  isPublished?: boolean
}) {
  return prisma.post.count({
    where: {
      category: "BULLETIN",
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
  })
}

export async function findBulletinPageByOffset(params: {
  take: number
  skip: number
  query?: string
  isPublished?: boolean
}) {
  return prisma.post.findMany({
    where: {
      category: "BULLETIN",
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
      ...(params.query
        ? {
            OR: [
              { title: { contains: params.query } },
              { content: { contains: params.query } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take,
    skip: params.skip,
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { displayName: true } },
      fileUsages: {
        where: { role: "ATTACHMENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { asset: { select: { originalName: true, url: true } } },
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
      fileUsages: {
        where: { role: "ATTACHMENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          asset: { select: { originalName: true, url: true } },
        },
      },
    },
  })
}

export async function findPublishedBulletinById(id: string) {
  return prisma.post.findFirst({
    where: {
      id,
      category: "BULLETIN",
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: { select: { displayName: true } },
      fileUsages: {
        where: { role: "ATTACHMENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { asset: { select: { originalName: true, url: true } } },
      },
    },
  })
}

export async function findPublishedBulletinNavigationList() {
  return prisma.post.findMany({
    where: {
      category: "BULLETIN",
      isPublished: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
    },
  })
}

export async function findBulletinTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      fileUsages: {
        where: { role: "ATTACHMENT" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, asset: { select: { id: true, url: true } } },
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
      fileUsages: {
        create: {
          role: "ATTACHMENT",
          asset: {
            create: {
              bucket: params.attachment.bucket,
              objectKey: params.attachment.objectKey,
              originalName: params.attachment.originalName,
              mimeType: params.attachment.mimeType,
              sizeBytes: params.attachment.sizeBytes,
              url: params.attachment.url,
              uploadedById: params.attachment.uploadedById,
            },
          },
        },
      },
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
        ? {
            fileUsages: {
              create: {
                role: "ATTACHMENT",
                asset: {
                  create: {
                    bucket: params.newAttachment.bucket,
                    objectKey: params.newAttachment.objectKey,
                    originalName: params.newAttachment.originalName,
                    mimeType: params.newAttachment.mimeType,
                    sizeBytes: params.newAttachment.sizeBytes,
                    url: params.newAttachment.url,
                    uploadedById: params.newAttachment.uploadedById,
                  },
                },
              },
            },
          }
        : {}),
    },
  })
}

export async function deleteAttachmentById(id: string) {
  return prisma.postAsset.delete({ where: { id } })
}

export async function findBulletinDeleteTargetById(id: string) {
  return prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      id: true,
      fileUsages: {
        where: { role: "ATTACHMENT" },
        select: { id: true, asset: { select: { id: true, url: true } } },
      },
    },
  })
}

export async function deleteBulletinById(id: string) {
  return prisma.post.delete({ where: { id } })
}
