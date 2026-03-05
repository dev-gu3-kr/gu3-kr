import { prisma } from "@/lib/prisma"

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

export async function findAdminUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function findAdminUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

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
