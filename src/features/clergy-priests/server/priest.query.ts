import { prisma } from "@/lib/prisma"

// 신부님 목록을 커서 기반으로 조회한다.
export async function findPriestPage(params: {
  take: number
  cursor?: string
}) {
  return prisma.clergyProfile.findMany({
    where: { type: "PRIEST" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: params.take,
    ...(params.cursor
      ? {
          cursor: { id: params.cursor },
          skip: 1,
        }
      : {}),
  })
}

// 신부님 상세를 ID로 조회한다.
export async function findPriestById(id: string) {
  return prisma.clergyProfile.findFirst({
    where: { id, type: "PRIEST" },
  })
}

// 신부님 프로필 레코드를 생성한다.
export async function createPriest(data: {
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
  return prisma.clergyProfile.create({
    data: {
      type: "PRIEST",
      ...data,
    },
  })
}

// 신부님 프로필 레코드를 수정한다.
export async function updatePriest(
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
  return prisma.clergyProfile.update({
    where: { id },
    data,
  })
}

// 신부님 프로필 레코드를 삭제한다.
export async function deletePriest(id: string) {
  return prisma.clergyProfile.delete({ where: { id } })
}
