import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"

export async function GET(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      role: author.role,
      displayName: author.displayName,
      menuPermissions: author.menuPermissions,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
