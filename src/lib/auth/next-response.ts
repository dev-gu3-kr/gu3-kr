import type { NextResponse } from "next/server"
import type { AuthCookieMutation } from "./cookies"

// service가 생성한 쿠키 변경을 HTTP 응답 경계에서만 적용한다.
export function applyAuthCookies(
  response: NextResponse,
  cookies: AuthCookieMutation[],
) {
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options)
  }
}
