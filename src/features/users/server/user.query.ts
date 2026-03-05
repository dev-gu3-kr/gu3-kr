import { prisma } from "@/lib/prisma"

// 관리자 사용자 목록을 최근 생성순으로 조회한다.
export async function findAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })
}

// 사용자 단건을 id로 조회한다.
export async function findAdminUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

// 이메일 기준으로 기존 사용자 존재 여부를 확인한다.
export async function findAdminUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

// 관리자 사용자 계정을 생성한다.
export async function createAdminUser(data: {
  username: string
  displayName: string
  email: string
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER"
  passwordHash: string
  isActive: boolean
}) {
  return prisma.user.create({ data })
}

// 관리자 사용자 정보를 수정한다.
export async function updateAdminUser(
  id: string,
  data: {
    displayName?: string
    email?: string | null
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER"
    isActive?: boolean
    passwordHash?: string
  },
) {
  return prisma.user.update({ where: { id }, data })
}

// 관리자 사용자 계정을 삭제한다.
export async function deleteAdminUser(id: string) {
  return prisma.user.delete({ where: { id } })
}
