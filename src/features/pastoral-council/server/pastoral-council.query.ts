import type {
  PastoralCouncilChildrenLayout,
  PastoralCouncilPlaceholderImageType,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"

type PastoralCouncilMemberMutationData = {
  positionId: string
  name: string
  baptismalName?: string
  phone: string | null
  imageUrl: string | null
  placeholderImageType: PastoralCouncilPlaceholderImageType
  isActive: boolean
  sortOrder: number
}

type PastoralCouncilPositionMutationData = {
  title: string
  parentId: string | null
  sortOrder: number
  childrenLayout: PastoralCouncilChildrenLayout
  childrenColumns: number
  isActive: boolean
  defaultPlaceholderImageType: PastoralCouncilPlaceholderImageType
}

const memberWithPosition = {
  position: { select: { id: true, title: true } },
} as const

const positionWithMemberCount = {
  _count: {
    select: { members: { where: { isActive: true } } },
  },
} as const

export async function findPastoralCouncilPage(params: {
  take: number
  cursor?: string
}) {
  return prisma.pastoralCouncilMember.findMany({
    include: memberWithPosition,
    orderBy: [
      { position: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    take: params.take,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })
}

export async function findPublicPastoralCouncilMembers() {
  return prisma.pastoralCouncilMember.findMany({
    where: { isActive: true },
    include: memberWithPosition,
    orderBy: [
      { position: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  })
}

export async function findPastoralCouncilById(id: string) {
  return prisma.pastoralCouncilMember.findUnique({
    where: { id },
    include: memberWithPosition,
  })
}

export async function createPastoralCouncilMember(
  data: PastoralCouncilMemberMutationData,
) {
  return prisma.pastoralCouncilMember.create({
    data,
    include: memberWithPosition,
  })
}

export async function updatePastoralCouncilMember(
  id: string,
  data: PastoralCouncilMemberMutationData,
) {
  return prisma.pastoralCouncilMember.update({
    where: { id },
    data,
    include: memberWithPosition,
  })
}

export async function deletePastoralCouncilMember(id: string) {
  return prisma.pastoralCouncilMember.delete({ where: { id } })
}

export async function findPastoralCouncilPositions() {
  return prisma.pastoralCouncilPosition.findMany({
    include: positionWithMemberCount,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
}

export async function findPastoralCouncilPositionById(id: string) {
  return prisma.pastoralCouncilPosition.findUnique({
    where: { id },
    include: {
      ...positionWithMemberCount,
      _count: { select: { children: true, members: true } },
    },
  })
}

export async function createPastoralCouncilPosition(
  data: PastoralCouncilPositionMutationData,
) {
  return prisma.pastoralCouncilPosition.create({
    data,
    include: positionWithMemberCount,
  })
}

export async function updatePastoralCouncilPosition(
  id: string,
  data: PastoralCouncilPositionMutationData,
) {
  return prisma.pastoralCouncilPosition.update({
    where: { id },
    data,
    include: positionWithMemberCount,
  })
}

export async function deletePastoralCouncilPosition(id: string) {
  return prisma.pastoralCouncilPosition.delete({ where: { id } })
}
