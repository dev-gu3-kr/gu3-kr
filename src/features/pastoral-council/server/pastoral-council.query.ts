import { prisma } from "@/lib/prisma"

export async function findPastoralCouncilPage(params: {
  take: number
  cursor?: string
}) {
  return prisma.pastoralCouncilMember.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: params.take,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })
}

export async function findPastoralCouncilById(id: string) {
  return prisma.pastoralCouncilMember.findUnique({ where: { id } })
}

export async function createPastoralCouncil(data: {
  name: string
  baptismalName?: string
  duty: string
  phone: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
}) {
  return prisma.pastoralCouncilMember.create({ data })
}

export async function updatePastoralCouncil(
  id: string,
  data: {
    name: string
    baptismalName?: string
    duty: string
    phone: string
    imageUrl?: string
    isActive: boolean
    sortOrder: number
  },
) {
  return prisma.pastoralCouncilMember.update({ where: { id }, data })
}

export async function deletePastoralCouncil(id: string) {
  return prisma.pastoralCouncilMember.delete({ where: { id } })
}
