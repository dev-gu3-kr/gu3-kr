// 수녀 프로필 도메인 서비스: 입력 정규화, 검증, 쿼리 레이어 호출을 담당한다.

import type { UpsertNunInputDto } from "@/features/clergy-nuns/isomorphic"
import {
  createNun,
  deleteNun,
  findNunById,
  findNunPage,
  updateNun,
} from "./nun.query"

// ISO 문자열(또는 undefined)을 Date 타입으로 변환한다.
function toDate(input?: string) {
  return input ? new Date(input) : undefined
}

// 목록 조회 서비스: 쿼리 결과와 다음 커서(nextCursor)를 함께 반환한다.
export async function getNunPage(params: { take?: number; cursor?: string }) {
  const take = params.take ?? 10
  const items = await findNunPage({ take, cursor: params.cursor })
  const nextCursor =
    items.length === take ? (items[items.length - 1]?.id ?? null) : null
  return { items, nextCursor }
}

// 단건 조회 서비스: id로 수녀 프로필 1건을 조회한다.
export async function getNunById(id: string) {
  return findNunById(id)
}

// 생성 서비스: trim/기본값 정규화 후 NUN 프로필을 저장한다.
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

// 수정 서비스: 입력값 정규화 후 기존 NUN 프로필을 갱신한다.
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

// 삭제 서비스: id 기준으로 NUN 프로필을 제거한다.
export async function removeNunProfile(id: string) {
  return deleteNun(id)
}
