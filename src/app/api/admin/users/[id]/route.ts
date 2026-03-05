import { NextResponse } from "next/server"
import { updateAdminUserSchema } from "@/features/users/isomorphic"
import { userService } from "@/features/users/server"
import { assertSuperAdminSession } from "@/lib/admin/session"

// 관리자 세션 쿠키에서 로그인 식별자를 추출한다.

// 개별 사용자 수정/삭제도 최고관리자 권한으로만 허용한다.

// PATCH는 일반 정보 변경과 비밀번호 초기화를 함께 처리한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertSuperAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "최고관리자 권한이 필요합니다." },
      { status: 403 },
    )

  const json = await request.json().catch(() => null)
  const parsed = updateAdminUserSchema.safeParse(json)
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )

  const { id } = await context.params
  try {
    await userService.updateAdminUserAccount(id, parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "사용자 수정에 실패했습니다.",
      },
      { status: 400 },
    )
  }
}

// 삭제는 서비스 계층의 SUPER_ADMIN 보호 규칙을 거쳐 수행한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertSuperAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "최고관리자 권한이 필요합니다." },
      { status: 403 },
    )

  const { id } = await context.params
  try {
    await userService.removeAdminUserAccount(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "사용자 삭제에 실패했습니다.",
      },
      { status: 400 },
    )
  }
}
