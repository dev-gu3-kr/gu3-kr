import { NextResponse } from "next/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type { AdminUserListItemDto } from "@/features/users/isomorphic"
import { createAdminUserSchema } from "@/features/users/isomorphic"
import { userService } from "@/features/users/server"
import { assertSuperAdminSession } from "@/lib/admin/session"

// 관리자 세션 쿠키에서 로그인 식별자를 추출한다.

// 사용자 등록 관리 API는 최고관리자만 접근 가능하도록 서버에서 최종 검증한다.

// 관리자 사용자 목록을 반환한다.
export async function GET(request: Request) {
  const author = await assertSuperAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "최고관리자 권한이 필요합니다." },
      { status: 403 },
    )

  const items = await userService.getAdminUsers()
  const response: ApiResponseDto<{ items: AdminUserListItemDto[] }> = {
    ok: true,
    items: items.map((item) => ({
      id: item.id,
      displayName: item.displayName,
      email: item.email ?? "",
      role: item.role,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
    })),
  }

  return NextResponse.json(response)
}

// 관리자 사용자 계정을 생성한다.
export async function POST(request: Request) {
  const author = await assertSuperAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "최고관리자 권한이 필요합니다." },
      { status: 403 },
    )

  const json = await request.json().catch(() => null)
  const parsed = createAdminUserSchema.safeParse(json)
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )

  try {
    const created = await userService.createAdminUserAccount(parsed.data)
    return NextResponse.json({ ok: true, id: created.id })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "사용자 등록에 실패했습니다.",
      },
      { status: 400 },
    )
  }
}
