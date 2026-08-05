import { createHash, randomBytes, randomUUID } from "node:crypto"
import {
  ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS,
  issueAdminAccessToken,
  verifyAdminAccessToken,
} from "@/lib/auth/access-token"
import {
  ADMIN_ACCESS_COOKIE_KEY,
  ADMIN_REFRESH_COOKIE_KEY,
  buildAuthCookie,
  clearAuthCookie,
  getRequestCookie,
} from "@/lib/auth/cookies"
import { clearAdminCsrfCookie, issueAdminCsrfCookie } from "@/lib/auth/csrf"
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password"
import {
  ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
  ADMIN_REFRESH_TOKEN_ROTATE_AFTER_SECONDS,
} from "@/lib/auth/session-config"
import {
  createRefreshToken,
  deleteExpiredRefreshTokens,
  findRefreshTokenByHash,
  findUserById,
  findUserByUsername,
  revokeRefreshTokenFamily,
  rotateRefreshToken,
  updateUserPasswordHash,
} from "./auth.query"

const REFRESH_TOKEN_GRACE_SECONDS = 30
export async function authenticateAdmin(
  username: string,
  plainPassword: string,
) {
  const user = await findUserByUsername(username.trim().toLowerCase())
  const verification = await verifyPassword(
    plainPassword,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  )

  if (!user || !user.isActive || !verification.valid) return null

  if (verification.needsUpgrade) {
    await updateUserPasswordHash(user.id, await hashPassword(plainPassword))
  }

  return user
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

function buildRefreshToken() {
  return randomBytes(32).toString("base64url")
}

function issueAccessCookie(userId: string) {
  return buildAuthCookie(
    ADMIN_ACCESS_COOKIE_KEY,
    issueAdminAccessToken(userId),
    ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS,
  )
}

function issueRefreshCookie(token: string) {
  return buildAuthCookie(
    ADMIN_REFRESH_COOKIE_KEY,
    token,
    ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
  )
}

export async function issueAuthCookies(userId: string) {
  const refreshToken = buildRefreshToken()
  const now = new Date()

  await Promise.all([
    createRefreshToken({
      userId,
      familyId: randomUUID(),
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(
        now.getTime() + ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS * 1000,
      ),
    }),
    deleteExpiredRefreshTokens(now),
  ])

  return [
    issueAccessCookie(userId),
    issueRefreshCookie(refreshToken),
    issueAdminCsrfCookie(),
  ]
}

function getRequestAccessToken(request: Request) {
  const authorization = request.headers.get("authorization")
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice("Bearer ".length).trim()
    if (token) return token
  }

  return getRequestCookie(request, ADMIN_ACCESS_COOKIE_KEY)
}

export function getUserIdFromAccessToken(token: string) {
  try {
    return verifyAdminAccessToken(token).sub ?? null
  } catch {
    return null
  }
}

export async function getAdminFromAccessToken(request: Request) {
  const token = getRequestAccessToken(request)
  if (!token) return null

  const userId = getUserIdFromAccessToken(token)
  if (!userId) return null

  const user = await findUserById(userId)
  return user?.isActive ? user : null
}

export async function getAdminFromRefreshToken(refreshToken: string | null) {
  if (!refreshToken) return null

  const record = await findRefreshTokenByHash(hashRefreshToken(refreshToken))
  const now = new Date()

  if (
    !record ||
    record.revokedAt ||
    record.expiresAt <= now ||
    !record.user.isActive
  ) {
    return null
  }

  if (
    record.usedAt &&
    now.getTime() - record.usedAt.getTime() > REFRESH_TOKEN_GRACE_SECONDS * 1000
  ) {
    return null
  }

  return record.user
}

type RefreshResult =
  | { ok: true; cookies: ReturnType<typeof issueAccessCookie>[] }
  | { ok: false; reason: "AUTH_REQUIRED" | "EXPIRED" | "REUSED" | "RETRY" }

export async function refreshAuthCookies(
  request: Request,
): Promise<RefreshResult> {
  const refreshToken = getRequestCookie(request, ADMIN_REFRESH_COOKIE_KEY)
  if (!refreshToken) return { ok: false, reason: "AUTH_REQUIRED" }

  const currentHash = hashRefreshToken(refreshToken)
  const record = await findRefreshTokenByHash(currentHash)
  if (!record) return { ok: false, reason: "AUTH_REQUIRED" }

  const now = new Date()
  if (record.revokedAt || !record.user.isActive) {
    return { ok: false, reason: "AUTH_REQUIRED" }
  }

  if (record.expiresAt <= now) {
    await revokeRefreshTokenFamily(record.familyId, now)
    return { ok: false, reason: "EXPIRED" }
  }

  if (record.usedAt) {
    const withinGrace =
      now.getTime() - record.usedAt.getTime() <=
      REFRESH_TOKEN_GRACE_SECONDS * 1000

    if (withinGrace) return { ok: false, reason: "RETRY" }

    await revokeRefreshTokenFamily(record.familyId, now)
    return { ok: false, reason: "REUSED" }
  }

  const shouldRotate =
    now.getTime() - record.createdAt.getTime() >=
    ADMIN_REFRESH_TOKEN_ROTATE_AFTER_SECONDS * 1000

  if (!shouldRotate) {
    return {
      ok: true,
      cookies: [issueAccessCookie(record.userId), issueAdminCsrfCookie()],
    }
  }

  const nextRefreshToken = buildRefreshToken()
  const rotated = await rotateRefreshToken({
    currentTokenHash: currentHash,
    userId: record.userId,
    familyId: record.familyId,
    tokenHash: hashRefreshToken(nextRefreshToken),
    expiresAt: new Date(
      now.getTime() + ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS * 1000,
    ),
    now,
  })

  if (!rotated) return { ok: false, reason: "RETRY" }

  return {
    ok: true,
    cookies: [
      issueAccessCookie(record.userId),
      issueRefreshCookie(nextRefreshToken),
      issueAdminCsrfCookie(),
    ],
  }
}

export async function revokeAuthSession(request: Request) {
  const refreshToken = getRequestCookie(request, ADMIN_REFRESH_COOKIE_KEY)
  if (!refreshToken) return

  const record = await findRefreshTokenByHash(hashRefreshToken(refreshToken))
  if (record) {
    await revokeRefreshTokenFamily(record.familyId, new Date())
  }
}

export function clearAuthCookies() {
  return [
    clearAuthCookie(ADMIN_ACCESS_COOKIE_KEY),
    clearAuthCookie(ADMIN_REFRESH_COOKIE_KEY),
    clearAdminCsrfCookie(),
  ]
}

export async function getLoginCandidateById(id: string) {
  const user = await findUserById(id)
  return user?.isActive ? user : null
}
