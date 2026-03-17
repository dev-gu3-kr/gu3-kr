import type { UpsertPastoralCouncilInputDto } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilRoleSortOrder } from "@/features/pastoral-council/isomorphic"
import {
  createPastoralCouncil,
  deletePastoralCouncil,
  findPastoralCouncilById,
  findPastoralCouncilPage,
  findPublicPastoralCouncilList,
  updatePastoralCouncil,
} from "./pastoral-council.query"

function normalizeNullableString(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function toMutationData(input: UpsertPastoralCouncilInputDto) {
  return {
    role: input.role,
    name: input.name.trim(),
    baptismalName: normalizeNullableString(input.baptismalName) ?? undefined,
    phone: normalizeNullableString(input.phone),
    imageUrl: normalizeNullableString(input.imageUrl),
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? pastoralCouncilRoleSortOrder[input.role],
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

export async function getPublicPastoralCouncilList() {
  return findPublicPastoralCouncilList()
}

export async function getPastoralCouncilById(id: string) {
  return findPastoralCouncilById(id)
}

export async function createPastoralCouncilMember(
  input: UpsertPastoralCouncilInputDto,
) {
  return createPastoralCouncil(toMutationData(input))
}

export async function updatePastoralCouncilMember(
  id: string,
  input: UpsertPastoralCouncilInputDto,
) {
  return updatePastoralCouncil(id, toMutationData(input))
}

export async function removePastoralCouncilMember(id: string) {
  return deletePastoralCouncil(id)
}
