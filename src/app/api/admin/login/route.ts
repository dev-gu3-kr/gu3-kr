import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE_KEY,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  loginSchema,
} from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"

export async function POST(request: Request) {
  // 요청 본문(JSON)을 파싱한다.
  const json = await request.json().catch(() => null)

  // 로그인 입력값을 스키마로 검증한다.
  const parsed = loginSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  // 관리자 인증(이메일 + 비밀번호)을 수행한다.
  const user = await authService.authenticateAdmin(
    parsed.data.email,
    parsed.data.password,
  )

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  // 인증 성공 응답을 생성한다.
  const response = NextResponse.json({ ok: true })

  // 관리자 세션 쿠키를 설정한다.
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_KEY,
    value: user.id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })

  return response
}
