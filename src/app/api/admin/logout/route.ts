import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import { validateAdminCsrfRequest } from "@/lib/auth/csrf"
import { applyAuthCookies } from "@/lib/auth/next-response"

export async function POST(request: Request) {
  if (!validateAdminCsrfRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "요청 보안 검증에 실패했습니다." },
      { status: 403 },
    )
  }

  await authService.revokeAuthSession(request)

  const response = NextResponse.json({ ok: true })
  applyAuthCookies(response, authService.clearAuthCookies())
  return response
}
