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

  const result = await authService.refreshAuthCookies(request)
  if (!result.ok) {
    const response = NextResponse.json(
      {
        ok: false,
        message:
          result.reason === "RETRY"
            ? "인증 갱신이 진행 중입니다. 다시 시도해 주세요."
            : "로그인이 필요합니다.",
      },
      { status: result.reason === "RETRY" ? 409 : 401 },
    )

    if (result.reason !== "RETRY") {
      applyAuthCookies(response, authService.clearAuthCookies())
    }

    return response
  }

  const response = NextResponse.json({ ok: true })
  applyAuthCookies(response, result.cookies)
  return response
}
