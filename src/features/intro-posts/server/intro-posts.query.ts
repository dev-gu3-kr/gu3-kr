import { prisma } from "@/lib/prisma"
import type { IntroPostCategory } from "../isomorphic/intro-posts.types"

type PostImageRecord = {
  fileName: string
  originalName: string
  mimeType: string
  sizeBytes: number
  url: string
  isCover: boolean
  sortOrder: number
}

export async function createIntroPostRecord(params: {
  category: IntroPostCategory
  title: string
  slug: string
  content: string
  youtubeUrl: string | null
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
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      authorId: params.authorId,
      postImages: { create: params.imageRecord },
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      content: true,
      isPublished: true,
      createdAt: true,
      postImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { url: true },
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
      isPublished: true,
      createdAt: true,
      postImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { id: true, url: true },
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
      postImages: {
        orderBy: [
          { isCover: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        take: 1,
        select: { id: true, url: true },
      },
    },
  })
}

export async function replaceIntroPostRecord(params: {
  id: string
  title: string
  content: string
  youtubeUrl: string | null
  isPublished: boolean
  replaceImage?: PostImageRecord
}) {
  return prisma.post.update({
    where: { id: params.id },
    data: {
      title: params.title,
      content: params.content,
      youtubeUrl: params.youtubeUrl,
      isPublished: params.isPublished,
      publishedAt: params.isPublished ? new Date() : null,
      ...(params.replaceImage
        ? { postImages: { create: params.replaceImage } }
        : {}),
    },
  })
}

export async function deletePostImageById(id: string) {
  return prisma.postImage.delete({ where: { id } })
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
      postImages: { select: { url: true } },
    },
  })
}

export async function deleteIntroPostById(id: string) {
  return prisma.post.delete({
    where: { id },
  })
}
