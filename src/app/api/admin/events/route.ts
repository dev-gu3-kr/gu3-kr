import { NextResponse } from "next/server"
import { eventService } from "@/features/events/server"
import { assertAdminSession } from "@/lib/admin/session"

export async function GET(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 30)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 30

  const page = await eventService.getEventPage({
    take,
    cursor: searchParams.get("cursor") || undefined,
    query: (searchParams.get("query") || "").trim(),
    status: searchParams.get("status"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
  })

  return NextResponse.json({ ok: true, ...page })
}

export async function POST(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string
    description?: string
    startsAt?: string
    endsAt?: string
    isPublished?: boolean
  } | null

  const result = await eventService.createEvent({
    title: String(body?.title || ""),
    description: String(body?.description || ""),
    startsAtText: String(body?.startsAt || ""),
    endsAtText: String(body?.endsAt || ""),
    isPublished: body?.isPublished ?? true,
    createdById: author.id,
  })

  if ("error" in result) {
    return NextResponse.json(
      { ok: false, message: result.error },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true, id: result.created.id })
}
