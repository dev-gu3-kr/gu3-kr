import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.
export function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

// 요청에서 관리자 세션 유효성을 검사하고 계정을 반환한다.
export async function assertAdminSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

// 요청에서 최고관리자 세션을 검사한다.
export async function assertSuperAdminSession(request: Request) {
  const author = await assertAdminSession(request)
  if (!author || author.role !== "SUPER_ADMIN") return null
  return author
}
