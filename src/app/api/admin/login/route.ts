import { NextResponse } from "next/server"
import { loginSchema } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { isTrustedSameOriginRequest } from "@/lib/auth/csrf"
import { applyAuthCookies } from "@/lib/auth/next-response"

export async function POST(request: Request) {
  if (!isTrustedSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "요청 출처를 확인할 수 없습니다." },
      { status: 403 },
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const user = await authService.authenticateAdmin(
    parsed.data.username,
    parsed.data.password,
  )

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ ok: true })
  applyAuthCookies(response, await authService.issueAuthCookies(user.id))
  return response
}
