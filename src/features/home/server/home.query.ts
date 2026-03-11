import { prisma } from "@/lib/prisma"

export async function findPublishedBulletinsForHome(take: number) {
  return prisma.post.findMany({
    where: { category: "BULLETIN", isPublished: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: { id: true, title: true, createdAt: true },
  })
}

export async function findPublishedGalleriesForHome(take: number) {
  return prisma.post.findMany({
    where: { category: "GALLERY", isPublished: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      youtubeUrl: true,
      galleryImages: {
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

export async function findPublishedEventsByRange(params: {
  start: Date
  end: Date
}) {
  return prisma.event.findMany({
    where: {
      isPublished: true,
      startsAt: { lte: params.end },
      endsAt: { gte: params.start },
    },
    orderBy: [{ startsAt: "asc" }, { id: "desc" }],
    select: {
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
    },
  })
}
