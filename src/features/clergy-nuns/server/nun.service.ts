import type { UpsertNunInputDto } from "@/features/clergy-nuns/isomorphic"
import {
  createNun,
  deleteNun,
  findNunById,
  findNunPage,
  updateNun,
} from "./nun.query"

function toDate(input?: string) {
  return input ? new Date(input) : undefined
}

export async function getNunPage(params: { take?: number; cursor?: string }) {
  const take = params.take ?? 10
  const items = await findNunPage({ take, cursor: params.cursor })
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null
  return { items, nextCursor }
}

export async function getNunById(id: string) {
  return findNunById(id)
}

export async function createNunProfile(input: UpsertNunInputDto) {
  return createNun({
    name: input.name.trim(),
    baptismalName: input.baptismalName?.trim() || undefined,
    duty: input.duty.trim(),
    feastMonth: input.feastMonth,
    feastDay: input.feastDay,
    termStart: toDate(input.termStart),
    termEnd: toDate(input.termEnd),
    phone: input.phone?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    isCurrent: input.isCurrent ?? true,
    sortOrder: input.sortOrder ?? 0,
  })
}

export async function updateNunProfile(id: string, input: UpsertNunInputDto) {
  return updateNun(id, {
    name: input.name.trim(),
    baptismalName: input.baptismalName?.trim() || undefined,
    duty: input.duty.trim(),
    feastMonth: input.feastMonth,
    feastDay: input.feastDay,
    termStart: toDate(input.termStart),
    termEnd: toDate(input.termEnd),
    phone: input.phone?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    isCurrent: input.isCurrent ?? true,
    sortOrder: input.sortOrder ?? 0,
  })
}

export async function removeNunProfile(id: string) {
  return deleteNun(id)
}
