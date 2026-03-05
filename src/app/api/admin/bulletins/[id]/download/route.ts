import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { prisma } from "@/lib/prisma"

// 본당주보 첨부 파일을 same-origin 응답으로 중계해 브라우저 다운로드를 강제한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const bulletin = await prisma.post.findFirst({
    where: { id, category: "BULLETIN" },
    select: {
      attachments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { originalName: true, url: true },
      },
    },
  })

  const attachment = bulletin?.attachments[0]
  if (!attachment) {
    return NextResponse.json(
      { ok: false, message: "첨부 파일을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  // MinIO 원본을 서버에서 중계해 Content-Disposition으로 다운로드를 강제한다.
  const upstream = await fetch(attachment.url)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { ok: false, message: "파일을 불러오지 못했습니다." },
      { status: 502 },
    )
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream"

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
      "Cache-Control": "private, no-store",
    },
  })
}
