import type { UpsertPastoralCouncilInputDto } from "@/features/pastoral-council/isomorphic"
import {
  createPastoralCouncil,
  deletePastoralCouncil,
  findPastoralCouncilById,
  findPastoralCouncilPage,
  updatePastoralCouncil,
} from "./pastoral-council.query"

export async function getPastoralCouncilPage(params: {
  take?: number
  cursor?: string
}) {
  const take = params.take ?? 10
  const items = await findPastoralCouncilPage({ take, cursor: params.cursor })
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null
  return { items, nextCursor }
}

export async function getPastoralCouncilById(id: string) {
  return findPastoralCouncilById(id)
}

export async function createPastoralCouncilMember(
  input: UpsertPastoralCouncilInputDto,
) {
  return createPastoralCouncil({
    name: input.name.trim(),
    baptismalName: input.baptismalName?.trim() || undefined,
    duty: input.duty.trim(),
    phone: input.phone.trim(),
    imageUrl: input.imageUrl?.trim() || undefined,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  })
}

export async function updatePastoralCouncilMember(
  id: string,
  input: UpsertPastoralCouncilInputDto,
) {
  return updatePastoralCouncil(id, {
    name: input.name.trim(),
    baptismalName: input.baptismalName?.trim() || undefined,
    duty: input.duty.trim(),
    phone: input.phone.trim(),
    imageUrl: input.imageUrl?.trim() || undefined,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  })
}

export async function removePastoralCouncilMember(id: string) {
  return deletePastoralCouncil(id)
}
