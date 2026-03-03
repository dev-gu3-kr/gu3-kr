import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"

export function proxy(request: NextRequest) {
  // 현재 요청 경로를 확인한다.
  const { pathname } = request.nextUrl

  // 관리자 세션 쿠키 존재 여부를 확인한다.
  const hasAdminSession = Boolean(
    request.cookies.get(ADMIN_SESSION_COOKIE_KEY)?.value,
  )

  // 로그인 페이지 접근 시 이미 로그인되어 있으면 관리자 메인으로 보낸다.
  if (pathname === "/admin/login" && hasAdminSession) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // 로그인 페이지를 제외한 관리자 경로는 인증이 없으면 로그인으로 보낸다.
  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !hasAdminSession
  ) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
