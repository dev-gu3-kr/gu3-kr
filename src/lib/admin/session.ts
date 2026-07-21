import { authService } from "@/features/auth/server"
import {
  ADMIN_ACCESS_COOKIE_KEY,
  getCookieFromHeader,
} from "@/lib/auth/cookies"

// 서명과 만료 검증을 통과한 access JWT에서만 관리자 식별자를 반환한다.
export function getAuthorIdFromCookieHeader(cookieHeader: string) {
  const accessToken = getCookieFromHeader(cookieHeader, ADMIN_ACCESS_COOKIE_KEY)
  return accessToken ? authService.getUserIdFromAccessToken(accessToken) : null
}

// 요청 access JWT와 활성 계정을 모두 검증해 보호 API의 관리자 정보를 반환한다.
export async function assertAdminSession(request: Request) {
  return authService.getAdminFromAccessToken(request)
}

export async function assertSuperAdminSession(request: Request) {
  const author = await assertAdminSession(request)
  if (!author || author.role !== "SUPER_ADMIN") return null
  return author
}
