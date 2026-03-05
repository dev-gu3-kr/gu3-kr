import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { updateAdminUserSchema } from "@/features/users/isomorphic"
import { userService } from "@/features/users/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

async function assertSuperAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  const author = await authService.getLoginCandidateById(authorId)
  if (!author || author.role !== "SUPER_ADMIN") return null
  return author
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertSuperAdmin(request)
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertSuperAdmin(request)
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
