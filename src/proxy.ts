import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import { canAccessAdminPath } from "@/lib/admin/menu-authorization"
import { ADMIN_REFRESH_COOKIE_KEY } from "@/lib/auth/cookies"
import { validateAdminCsrfRequest } from "@/lib/auth/csrf"

const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/refresh",
])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const bearerToken = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1]
  const refreshToken =
    request.cookies.get(ADMIN_REFRESH_COOKIE_KEY)?.value ?? null

  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_API_PATHS.has(pathname)) return NextResponse.next()

    const author = await authService.getAdminFromAccessToken(request)
    if (!author) {
      return NextResponse.json(
        { ok: false, message: "인증 갱신이 필요합니다." },
        { status: 401 },
      )
    }

    if (!bearerToken && !validateAdminCsrfRequest(request)) {
      return NextResponse.json(
        { ok: false, message: "요청 보안 검증에 실패했습니다." },
        { status: 403 },
      )
    }

    if (!canAccessAdminPath(pathname, author.role, author.menuPermissions)) {
      return NextResponse.json(
        { ok: false, message: "이 메뉴에 접근할 권한이 없습니다." },
        { status: 403 },
      )
    }

    return NextResponse.next()
  }

  const author =
    (await authService.getAdminFromAccessToken(request)) ??
    (await authService.getAdminFromRefreshToken(refreshToken))

  if (pathname === "/admin/login" && author) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !author) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    author &&
    !canAccessAdminPath(pathname, author.role, author.menuPermissions)
  ) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
