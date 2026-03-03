// NUN 전용 Prisma 조회/저장 쿼리를 모아둔 레이어다. (정렬/페이징 기준의 단일 소스)

import { prisma } from "@/lib/prisma"

// 목록 페이지 조회: 정렬 기준(sortOrder asc, createdAt desc)과 cursor 기반 페이징을 적용한다.
export async function findNunPage(params: { take: number; cursor?: string }) {
  return prisma.clergyProfile.findMany({
    where: { type: "NUN" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: params.take,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })
}

// 단건 조회: NUN 타입 조건을 포함해 다른 타입 데이터 혼입을 막는다.
export async function findNunById(id: string) {
  return prisma.clergyProfile.findFirst({ where: { id, type: "NUN" } })
}

// 프로필 생성: type=NUN을 강제 주입해 저장한다.
export async function createNun(data: {
  name: string
  baptismalName?: string
  duty: string
  feastMonth?: number
  feastDay?: number
  termStart?: Date
  termEnd?: Date
  phone?: string
  imageUrl?: string
  isCurrent: boolean
  sortOrder: number
}) {
  return prisma.clergyProfile.create({ data: { type: "NUN", ...data } })
}

// 프로필 수정: PK(id) 기준으로 필드를 갱신한다.
export async function updateNun(
  id: string,
  data: {
    name: string
    baptismalName?: string
    duty: string
    feastMonth?: number
    feastDay?: number
    termStart?: Date
    termEnd?: Date
    phone?: string
    imageUrl?: string
    isCurrent: boolean
    sortOrder: number
  },
) {
  return prisma.clergyProfile.update({ where: { id }, data })
}

// 프로필 삭제: PK(id) 기준으로 레코드를 제거한다.
export async function deleteNun(id: string) {
  return prisma.clergyProfile.delete({ where: { id } })
}
