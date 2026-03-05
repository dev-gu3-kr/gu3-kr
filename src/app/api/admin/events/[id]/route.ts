import { NextResponse } from "next/server"
import { assertAdminSession } from "@/lib/admin/session"
import { prisma } from "@/lib/prisma"

// 단건 조회/수정/삭제 모두 동일한 관리자 인증 규칙을 사용한다.

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
  const item = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      isPublished: true,
      createdAt: true,
    },
  })

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
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
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const target = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!target) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const body = (await request.json().catch(() => null)) as {
    title?: string
    description?: string
    startsAt?: string
    endsAt?: string
    isPublished?: boolean
  } | null

  const title = String(body?.title || "").trim()
  const description = String(body?.description || "").trim()
  const startsAtText = String(body?.startsAt || "")
  const endsAtText = String(body?.endsAt || "")
  const isPublished = body?.isPublished ?? true

  if (!title || !description || !startsAtText || !endsAtText) {
    return NextResponse.json(
      { ok: false, message: "제목/내용/시작/종료는 필수입니다." },
      { status: 400 },
    )
  }

  const startsAt = new Date(startsAtText)
  const endsAt = new Date(endsAtText)

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return NextResponse.json(
      { ok: false, message: "일정 날짜 형식이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  // 수정 시에도 생성과 동일한 날짜 유효성 규칙(종료>=시작)을 강제한다.
  if (endsAt < startsAt) {
    return NextResponse.json(
      { ok: false, message: "종료일은 시작일보다 빠를 수 없습니다." },
      { status: 400 },
    )
  }

  await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      startsAt,
      endsAt,
      isPublished,
    },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
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
  const target = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!target) {
    return NextResponse.json(
      { ok: false, message: "일정을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await prisma.event.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
