import { prisma } from "@/lib/prisma"

export async function findEventPageRows(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
  from?: string | null
  to?: string | null
}) {
  return prisma.event.findMany({
    where: {
      ...(params.query ? { title: { contains: params.query } } : {}),
      ...(params.status === "published"
        ? { isPublished: true }
        : params.status === "draft"
          ? { isPublished: false }
          : {}),
      ...(params.from || params.to
        ? {
            startsAt: {
              ...(params.from ? { gte: new Date(params.from) } : {}),
              ...(params.to ? { lte: new Date(params.to) } : {}),
            },
          }
        : {}),
    },
    orderBy:
      params.from || params.to
        ? [{ startsAt: "asc" }, { id: "desc" }]
        : [{ createdAt: "desc" }, { id: "desc" }],
    take: params.take + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      isPublished: true,
      createdAt: true,
    },
  })
}

export async function createEventRecord(params: {
  title: string
  description: string
  startsAt: Date
  endsAt: Date
  isPublished: boolean
  createdById: string
}) {
  return prisma.event.create({
    data: params,
    select: { id: true },
  })
}

export async function findEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      isPublished: true,
      createdAt: true,
    },
  })
}

export async function updateEventById(
  id: string,
  params: {
    title: string
    description: string
    startsAt: Date
    endsAt: Date
    isPublished: boolean
  },
) {
  return prisma.event.update({
    where: { id },
    data: params,
  })
}

export async function deleteEventById(id: string) {
  return prisma.event.delete({ where: { id } })
}
