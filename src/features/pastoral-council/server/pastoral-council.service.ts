import type {
  UpsertPastoralCouncilInputDto,
  UpsertPastoralCouncilPositionInputDto,
} from "@/features/pastoral-council/isomorphic"
import {
  createsPastoralCouncilPositionCycle,
  pastoralCouncilDefaultPlaceholderImageType,
} from "@/features/pastoral-council/isomorphic"
import {
  createPastoralCouncilMember as createMember,
  createPastoralCouncilPosition as createPosition,
  deletePastoralCouncilMember,
  deletePastoralCouncilPosition,
  findPastoralCouncilById,
  findPastoralCouncilPage,
  findPastoralCouncilPositionById,
  findPastoralCouncilPositions,
  findPublicPastoralCouncilMembers,
  updatePastoralCouncilMember as updateMember,
  updatePastoralCouncilPosition as updatePosition,
} from "./pastoral-council.query"

export class PastoralCouncilPositionError extends Error {
  constructor(
    readonly code: "PARENT_NOT_FOUND" | "CYCLIC_PARENT" | "POSITION_IN_USE",
    message: string,
  ) {
    super(message)
    this.name = "PastoralCouncilPositionError"
  }
}

function normalizeNullableString(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function toMemberMutationData(input: UpsertPastoralCouncilInputDto) {
  return {
    positionId: input.positionId,
    name: input.name.trim(),
    baptismalName: normalizeNullableString(input.baptismalName) ?? undefined,
    phone: normalizeNullableString(input.phone),
    imageUrl: normalizeNullableString(input.imageUrl),
    placeholderImageType:
      input.placeholderImageType ?? pastoralCouncilDefaultPlaceholderImageType,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  }
}

function toPositionMutationData(input: UpsertPastoralCouncilPositionInputDto) {
  return {
    title: input.title.trim(),
    parentId: input.parentId ?? null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    defaultPlaceholderImageType:
      input.defaultPlaceholderImageType ??
      pastoralCouncilDefaultPlaceholderImageType,
  }
}

function filterPublicPositions<
  T extends { id: string; parentId: string | null; isActive: boolean },
>(positions: readonly T[]) {
  const positionById = new Map(
    positions.map((position) => [position.id, position]),
  )

  return positions.filter((position) => {
    if (!position.isActive) return false

    let parentId = position.parentId
    const visited = new Set<string>([position.id])
    while (parentId) {
      const parent = positionById.get(parentId)
      if (!parent?.isActive || visited.has(parentId)) return false
      visited.add(parentId)
      parentId = parent.parentId
    }
    return true
  })
}

async function assertParentExists(parentId: string | null) {
  if (!parentId) return
  const parent = await findPastoralCouncilPositionById(parentId)
  if (!parent) {
    throw new PastoralCouncilPositionError(
      "PARENT_NOT_FOUND",
      "상위 직책을 찾을 수 없습니다.",
    )
  }
}

export async function getPastoralCouncilPage(params: {
  take?: number
  cursor?: string
}) {
  const take = params.take ?? 30
  const items = await findPastoralCouncilPage({ take, cursor: params.cursor })
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null
  return { items, nextCursor }
}

export async function getPublicPastoralCouncil() {
  const [positions, members] = await Promise.all([
    findPastoralCouncilPositions(),
    findPublicPastoralCouncilMembers(),
  ])
  const publicPositions = filterPublicPositions(positions)
  const publicPositionIds = new Set(
    publicPositions.map((position) => position.id),
  )

  return {
    positions: publicPositions,
    members: members.filter((member) =>
      publicPositionIds.has(member.positionId),
    ),
  }
}

export async function getPastoralCouncilById(id: string) {
  return findPastoralCouncilById(id)
}

export async function createPastoralCouncilMember(
  input: UpsertPastoralCouncilInputDto,
) {
  await assertParentExists(input.positionId)
  return createMember(toMemberMutationData(input))
}

export async function updatePastoralCouncilMember(
  id: string,
  input: UpsertPastoralCouncilInputDto,
) {
  await assertParentExists(input.positionId)
  return updateMember(id, toMemberMutationData(input))
}

export async function removePastoralCouncilMember(id: string) {
  return deletePastoralCouncilMember(id)
}

export async function getPastoralCouncilPositions() {
  return findPastoralCouncilPositions()
}

export async function getPastoralCouncilPositionById(id: string) {
  return findPastoralCouncilPositionById(id)
}

export async function createPastoralCouncilPosition(
  input: UpsertPastoralCouncilPositionInputDto,
) {
  const parentId = input.parentId ?? null
  await assertParentExists(parentId)
  return createPosition(toPositionMutationData(input))
}

export async function updatePastoralCouncilPosition(
  id: string,
  input: UpsertPastoralCouncilPositionInputDto,
) {
  const existing = await findPastoralCouncilPositionById(id)
  if (!existing) return null

  const parentId = input.parentId ?? null
  await assertParentExists(parentId)
  const positions = await findPastoralCouncilPositions()

  if (
    createsPastoralCouncilPositionCycle({
      positionId: id,
      parentId,
      positions,
    })
  ) {
    throw new PastoralCouncilPositionError(
      "CYCLIC_PARENT",
      "자기 자신이나 하위 직책을 상위 직책으로 지정할 수 없습니다.",
    )
  }

  return updatePosition(id, toPositionMutationData(input))
}

export async function removePastoralCouncilPosition(id: string) {
  const position = await findPastoralCouncilPositionById(id)
  if (!position) return null

  if (position._count.children > 0 || position._count.members > 0) {
    throw new PastoralCouncilPositionError(
      "POSITION_IN_USE",
      "하위 직책이나 구성원이 있는 직책은 삭제할 수 없습니다.",
    )
  }

  return deletePastoralCouncilPosition(id)
}
