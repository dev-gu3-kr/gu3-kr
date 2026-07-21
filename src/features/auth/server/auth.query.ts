import { prisma } from "@/lib/prisma"

export async function findUserByEmail(email: string) {
  // 이메일로 관리자 계정을 조회한다.
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserById(id: string) {
  // 사용자 ID로 관리자 계정을 조회한다.
  return prisma.user.findUnique({ where: { id } })
}

export async function updateUserPasswordHash(id: string, passwordHash: string) {
  return prisma.user.update({ where: { id }, data: { passwordHash } })
}

type CreateRefreshTokenInput = {
  userId: string
  familyId: string
  tokenHash: string
  expiresAt: Date
}

export async function createRefreshToken(input: CreateRefreshTokenInput) {
  return prisma.adminRefreshToken.create({ data: input })
}

export async function findRefreshTokenByHash(tokenHash: string) {
  return prisma.adminRefreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })
}

type RotateRefreshTokenInput = CreateRefreshTokenInput & {
  currentTokenHash: string
  now: Date
}

// 현재 토큰을 한 번만 선점한 요청만 다음 토큰을 만들도록 트랜잭션으로 회전한다.
export async function rotateRefreshToken(input: RotateRefreshTokenInput) {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.adminRefreshToken.updateMany({
      where: {
        tokenHash: input.currentTokenHash,
        usedAt: null,
        revokedAt: null,
        expiresAt: { gt: input.now },
      },
      data: { usedAt: input.now, rotatedToHash: input.tokenHash },
    })

    if (claimed.count !== 1) return false

    await tx.adminRefreshToken.create({
      data: {
        userId: input.userId,
        familyId: input.familyId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    })

    return true
  })
}

export async function revokeRefreshTokenFamily(familyId: string, now: Date) {
  return prisma.adminRefreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: now },
  })
}

export async function deleteExpiredRefreshTokens(now: Date) {
  return prisma.adminRefreshToken.deleteMany({
    where: { expiresAt: { lt: now } },
  })
}
