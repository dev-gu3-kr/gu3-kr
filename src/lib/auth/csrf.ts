import { randomBytes, timingSafeEqual } from "node:crypto"
import {
  ADMIN_CSRF_COOKIE_KEY,
  buildAuthCookie,
  clearAuthCookie,
  getRequestCookie,
} from "./cookies"
import { ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS } from "./session-config"

export const ADMIN_CSRF_HEADER_KEY = "x-csrf-token"
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

export function issueAdminCsrfCookie() {
  return buildAuthCookie(
    ADMIN_CSRF_COOKIE_KEY,
    randomBytes(32).toString("base64url"),
    ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
    false,
  )
}

export function clearAdminCsrfCookie() {
  return clearAuthCookie(ADMIN_CSRF_COOKIE_KEY, false)
}

function safeTokenEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  )
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null
}

function addOrigin(target: Set<string>, value: string | null) {
  if (!value) return

  try {
    target.add(new URL(value).origin)
  } catch {
    // 잘못된 프록시/환경변수 값은 신뢰 후보에서 제외한다.
  }
}

function getTrustedRequestOrigins(request: Request) {
  const requestUrl = new URL(request.url)
  const trustedOrigins = new Set<string>([requestUrl.origin])
  const forwardedProtocol = getFirstHeaderValue(
    request.headers.get("x-forwarded-proto"),
  )
  const forwardedHost =
    getFirstHeaderValue(request.headers.get("x-forwarded-host")) ??
    getFirstHeaderValue(request.headers.get("host"))

  if (
    forwardedHost &&
    (forwardedProtocol === "http" || forwardedProtocol === "https")
  ) {
    addOrigin(trustedOrigins, `${forwardedProtocol}://${forwardedHost}`)
  }

  addOrigin(trustedOrigins, process.env.NEXT_PUBLIC_SITE_URL ?? null)
  return trustedOrigins
}

// 쿠키 인증을 사용하는 변경 요청은 double-submit 토큰으로 교차 출처 실행을 거부한다.
export function validateAdminCsrfRequest(request: Request) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true

  const cookieToken = getRequestCookie(request, ADMIN_CSRF_COOKIE_KEY)
  const headerToken = request.headers.get(ADMIN_CSRF_HEADER_KEY)

  return Boolean(
    cookieToken && headerToken && safeTokenEqual(cookieToken, headerToken),
  )
}

// 로그인 전에는 CSRF 쿠키가 없으므로 브라우저가 제공하는 동일 출처 신호를 검증한다.
export function isTrustedSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  if (origin) return getTrustedRequestOrigins(request).has(origin)

  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite) return fetchSite === "same-origin"

  return request.headers.get("x-requested-with") === "fetch"
}
