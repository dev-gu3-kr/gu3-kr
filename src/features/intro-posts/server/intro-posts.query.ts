import { prisma } from "@/lib/prisma"
import type { IntroPostCategory } from "../isomorphic/intro-posts.types"

type PostImageRecord = {
  url: string
}

export async function createIntroPostRecord(params: {
  category: IntroPostCategory
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
  sortOrder: number
  isPublished: boolean
  authorId: string
  imageRecord: PostImageRecord
}) {
  return prisma.post.create({
    data: {
      category: params.category,
      title: params.title,
      slug: params.slug,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      sortOrder: params.sortOrder,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      authorId: params.authorId,
      fileUsages: {
        create: {
          role: "COVER",
          asset: { connect: { url: params.imageRecord.url } },
        },
      },
    },
    select: { id: true },
  })
}

export async function findIntroPosts(params: {
  category: IntroPostCategory
  isPublished?: boolean
}) {
  return prisma.post.findMany({
    where: {
      category: params.category,
      ...(typeof params.isPublished === "boolean"
        ? { isPublished: params.isPublished }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      content: true,
      sortOrder: true,
      isPublished: true,
      createdAt: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function findIntroPostById(params: {
  category: IntroPostCategory
  id: string
}) {
  return prisma.post.findFirst({
    where: {
      id: params.id,
      category: params.category,
    },
    select: {
      id: true,
      title: true,
      content: true,
      sortOrder: true,
      isPublished: true,
      createdAt: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { id: true, asset: { select: { id: true, url: true } } },
      },
    },
  })
}

export async function findIntroPostTargetById(params: {
  category: IntroPostCategory
  id: string
}) {
  return prisma.post.findFirst({
    where: {
      id: params.id,
      category: params.category,
    },
    select: {
      id: true,
      fileUsages: {
        where: { role: "COVER" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: { id: true, asset: { select: { id: true, url: true } } },
      },
    },
  })
}

export async function replaceIntroPostRecord(params: {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  sortOrder: number
  isPublished: boolean
  replaceImage?: PostImageRecord
}) {
  return prisma.post.update({
    where: { id: params.id },
    data: {
      title: params.title,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      sortOrder: params.sortOrder,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      ...(params.replaceImage
        ? {
            fileUsages: {
              create: {
                role: "COVER",
                asset: { connect: { url: params.replaceImage.url } },
              },
            },
          }
        : {}),
    },
  })
}

export async function deletePostAssetById(id: string) {
  return prisma.postAsset.delete({ where: { id } })
}

export async function findIntroPostDeleteTargetById(params: {
  category: IntroPostCategory
  id: string
}) {
  return prisma.post.findFirst({
    where: {
      id: params.id,
      category: params.category,
    },
    select: {
      id: true,
      fileUsages: {
        select: { asset: { select: { url: true } } },
      },
    },
  })
}

export async function deleteIntroPostById(id: string) {
  return prisma.post.delete({
    where: { id },
  })
}
