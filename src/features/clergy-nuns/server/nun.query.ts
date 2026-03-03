import { prisma } from "@/lib/prisma"

export async function findNunPage(params: { take: number; cursor?: string }) {
  return prisma.clergyProfile.findMany({
    where: { type: "NUN" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: params.take,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })
}

export async function findNunById(id: string) {
  return prisma.clergyProfile.findFirst({ where: { id, type: "NUN" } })
}

export async function createNun(data: {
  name: string
  baptismalName?: string
  duty: string
  feastMonth?: number
  feastDay?: number
  termStart?: Date
  termEnd?: Date
  phone?: string
  imageUrl?: string
  isCurrent: boolean
  sortOrder: number
}) {
  return prisma.clergyProfile.create({ data: { type: "NUN", ...data } })
}

export async function updateNun(
  id: string,
  data: {
    name: string
    baptismalName?: string
    duty: string
    feastMonth?: number
    feastDay?: number
    termStart?: Date
    termEnd?: Date
    phone?: string
    imageUrl?: string
    isCurrent: boolean
    sortOrder: number
  },
) {
  return prisma.clergyProfile.update({ where: { id }, data })
}

export async function deleteNun(id: string) {
  return prisma.clergyProfile.delete({ where: { id } })
}
