import type { PastoralCouncilRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"

type PastoralCouncilMutationData = {
  role: PastoralCouncilRole
  name: string
  baptismalName?: string
  phone: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
}

export async function findPastoralCouncilPage(params: {
  take: number
  cursor?: string
}) {
  return prisma.pastoralCouncilMember.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: params.take,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })
}

export async function findPublicPastoralCouncilList() {
  return prisma.pastoralCouncilMember.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
}

export async function findPastoralCouncilById(id: string) {
  return prisma.pastoralCouncilMember.findUnique({ where: { id } })
}

export async function createPastoralCouncil(data: PastoralCouncilMutationData) {
  return prisma.pastoralCouncilMember.create({ data })
}

export async function updatePastoralCouncil(
  id: string,
  data: PastoralCouncilMutationData,
) {
  return prisma.pastoralCouncilMember.update({ where: { id }, data })
}

export async function deletePastoralCouncil(id: string) {
  return prisma.pastoralCouncilMember.delete({ where: { id } })
}
