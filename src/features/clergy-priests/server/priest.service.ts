// 신부 프로필 도메인 서비스: 입력 정규화, 검증, 쿼리 레이어 호출을 담당한다.

import type { UpsertPriestInputDto } from "@/features/clergy-priests/isomorphic"
import {
  createPriest,
  deletePriest,
  findPriestById,
  findPriestPage,
  updatePriest,
} from "./priest.query"

// ISO 문자열(또는 undefined)을 Date 타입으로 변환한다.
function toDate(input?: string) {
  return input ? new Date(input) : undefined
}

// 신부님 목록 페이지를 조회한다.
// 목록 조회 서비스: 쿼리 결과와 다음 커서(nextCursor)를 함께 반환한다.
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
// 단건 조회 서비스: id로 신부 프로필 1건을 조회한다.
export async function getPriestById(id: string) {
  return findPriestById(id)
}

// 신부님 프로필을 생성한다.
// 생성 서비스: trim/기본값 정규화 후 PRIEST 프로필을 저장한다.
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
// 수정 서비스: 입력값 정규화 후 기존 PRIEST 프로필을 갱신한다.
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
// 삭제 서비스: id 기준으로 PRIEST 프로필을 제거한다.
export async function removePriestProfile(id: string) {
  return deletePriest(id)
}
