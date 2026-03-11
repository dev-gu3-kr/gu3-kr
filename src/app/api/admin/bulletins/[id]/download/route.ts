import { NextResponse } from "next/server"
import { bulletinService } from "@/features/bulletins/server"
import { assertAdminSession } from "@/lib/admin/session"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const bulletin = await bulletinService.getBulletinById(id)
  const attachment = bulletin?.attachments[0]

  if (!attachment) {
    return NextResponse.json(
      { ok: false, message: "첨부 파일을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const upstream = await fetch(attachment.url)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { ok: false, message: "파일을 불러오지 못했습니다." },
      { status: 502 },
    )
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream"

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8${encodeURIComponent(attachment.originalName)}`,
      "Cache-Control": "private, no-store",
    },
  })
}
