import { NextResponse } from "next/server"
import { eventService } from "@/features/events/server"
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
  const item = await eventService.getEventById(id)
  if (!item) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item })
}

export async function PATCH(
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
  const body = (await request.json().catch(() => null)) as {
    title?: string
    description?: string
    startsAt?: string
    endsAt?: string
    isPublished?: boolean
  } | null

  const result = await eventService.updateEvent({
    id,
    title: String(body?.title || ""),
    description: String(body?.description || ""),
    startsAtText: String(body?.startsAt || ""),
    endsAtText: String(body?.endsAt || ""),
    isPublished: body?.isPublished ?? true,
  })

  if ("notFound" in result) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if ("error" in result) {
    return NextResponse.json(
      { ok: false, message: result.error },
      { status: 400 },
    )
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
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
  const result = await eventService.removeEvent(id)

  if ("notFound" in result) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true })
}
