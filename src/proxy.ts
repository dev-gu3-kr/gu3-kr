import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { isValidAdminAccessToken } from "@/lib/auth/access-token"
import {
  ADMIN_ACCESS_COOKIE_KEY,
  ADMIN_REFRESH_COOKIE_KEY,
} from "@/lib/auth/cookies"
import { validateAdminCsrfRequest } from "@/lib/auth/csrf"

const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/refresh",
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const bearerToken = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1]
  const hasValidBearerToken = isValidAdminAccessToken(bearerToken)
  const hasValidAccessToken =
    isValidAdminAccessToken(
      request.cookies.get(ADMIN_ACCESS_COOKIE_KEY)?.value,
    ) || hasValidBearerToken
  const hasRefreshToken = Boolean(
    request.cookies.get(ADMIN_REFRESH_COOKIE_KEY)?.value,
  )

  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_API_PATHS.has(pathname)) return NextResponse.next()

    if (!hasValidAccessToken) {
      return NextResponse.json(
        { ok: false, message: "인증 갱신이 필요합니다." },
        { status: 401 },
      )
    }

    if (!hasValidBearerToken && !validateAdminCsrfRequest(request)) {
      return NextResponse.json(
        { ok: false, message: "요청 보안 검증에 실패했습니다." },
        { status: 403 },
      )
    }

    return NextResponse.next()
  }

  if (pathname === "/admin/login" && hasValidAccessToken) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !hasValidAccessToken &&
    !hasRefreshToken
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
