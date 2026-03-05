import { prisma } from "@/lib/prisma"

export async function findAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })
}

export async function findAdminUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function findAdminUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } })
}

export async function createAdminUser(data: {
  username: string
  displayName: string
  email?: string
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "VIEWER"
  passwordHash: string
  isActive: boolean
}) {
  return prisma.user.create({ data })
}

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

export async function deleteAdminUser(id: string) {
  return prisma.user.delete({ where: { id } })
}
