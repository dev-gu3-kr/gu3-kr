import type { UpsertPriestInputDto } from "@/features/clergy-priests/isomorphic"
import {
  createPriest,
  deletePriest,
  findPriestById,
  findPriestPage,
  updatePriest,
} from "./priest.query"

function toDate(input?: string) {
  return input ? new Date(input) : undefined
}

// 신부님 목록 페이지를 조회한다.
export async function getPriestPage(params: {
  take?: number
  cursor?: string
}) {
  const take = params.take ?? 10
  const items = await findPriestPage({ take, cursor: params.cursor })
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null

  return { items, nextCursor }
}

// 신부님 상세를 조회한다.
export async function getPriestById(id: string) {
  return findPriestById(id)
}

// 신부님 프로필을 생성한다.
export async function createPriestProfile(input: UpsertPriestInputDto) {
  return createPriest({
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

// 신부님 프로필을 수정한다.
export async function updatePriestProfile(
  id: string,
  input: UpsertPriestInputDto,
) {
  return updatePriest(id, {
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

// 신부님 프로필을 삭제한다.
export async function removePriestProfile(id: string) {
  return deletePriest(id)
}
