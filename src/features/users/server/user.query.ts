import type { AdminMenuPermission, UserRole } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// 관리자 사용자 목록을 최근 생성순으로 조회한다.
export async function findAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      displayName: true,
      username: true,
      role: true,
      menuPermissions: true,
      isActive: true,
      createdAt: true,
    },
  })
}

// 사용자 단건을 id로 조회한다.
export async function findAdminUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function findAdminUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } })
}

// 관리자 사용자 계정을 생성한다.
export async function createAdminUser(data: {
  username: string
  displayName: string
  role: UserRole
  menuPermissions: AdminMenuPermission[]
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
    username?: string
    role?: UserRole
    menuPermissions?: AdminMenuPermission[]
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
