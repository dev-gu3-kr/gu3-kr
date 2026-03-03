import { prisma } from "@/lib/prisma"

export async function findUserByEmail(email: string) {
  // 이메일로 관리자 계정을 조회한다.
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(id: string) {
  // 사용자 ID로 관리자 계정을 조회한다.
  return prisma.user.findUnique({ where: { id } })
}
