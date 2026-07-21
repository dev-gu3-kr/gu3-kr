import jwt, { type JwtPayload } from "jsonwebtoken"

export const ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15

function getAccessTokenSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_TOKEN_SECRET은 32자 이상으로 설정해야 합니다.")
  }

  return secret
}

// 짧게 유지되는 관리자 access JWT에 사용자 식별자와 토큰 용도를 서명한다.
export function issueAdminAccessToken(userId: string) {
  return jwt.sign(
    { sub: userId, typ: "admin_access" },
    getAccessTokenSecret(),
    {
      algorithm: "HS256",
      expiresIn: ADMIN_ACCESS_TOKEN_MAX_AGE_SECONDS,
    },
  )
}

// 허용 알고리즘과 토큰 용도를 함께 제한해 다른 JWT의 관리자 세션 전용을 차단한다.
export function verifyAdminAccessToken(token: string) {
  const payload = jwt.verify(token, getAccessTokenSecret(), {
    algorithms: ["HS256"],
  }) as JwtPayload

  if (payload.typ !== "admin_access" || typeof payload.sub !== "string") {
    throw new Error("ADMIN_ACCESS_TOKEN_INVALID")
  }

  return payload
}

// proxy가 DB 조회 없이 서명과 만료를 확인할 수 있게 안전한 boolean 결과를 제공한다.
export function isValidAdminAccessToken(token: string | null | undefined) {
  if (!token) return false

  try {
    verifyAdminAccessToken(token)
    return true
  } catch {
    return false
  }
}
