import { NextResponse } from "next/server"
import { z } from "zod"

import { authService } from "@/features/auth/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"
import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

const updateInquirySchema = z.object({
  status: z.enum(["RECEIVED", "IN_PROGRESS", "DONE"]).optional(),
  note: z.string().trim().max(3000).optional().or(z.literal("")),
})

async function requireAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return {
      error: NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 },
      ),
    }
  }

  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return {
      error: NextResponse.json(
        { ok: false, message: "유효하지 않은 세션입니다." },
        { status: 401 },
      ),
    }
  }

  return { authorId }
}

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      email: true,
      phone: true,
      content: true,
      status: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      processedAt: true,
      processingMemo: true,
      processedById: true,
    },
  })

  if (!inquiry) {
    return NextResponse.json(
      { ok: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item: inquiry })
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const { id } = await params
  const json = await request.json().catch(() => null)
  const parsed = updateInquirySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!inquiry) {
    return NextResponse.json(
      { ok: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const note = parsed.data.note?.trim()
  const nextStatus = parsed.data.status

  const updated = await prisma.inquiry.update({
    where: { id },
    data: {
      ...(nextStatus !== undefined
        ? {
            status: nextStatus,
            processedAt: nextStatus === "DONE" ? new Date() : null,
            processedById: nextStatus === "DONE" ? auth.authorId : null,
          }
        : {}),
      ...(parsed.data.note !== undefined
        ? { processingMemo: note ? note : null }
        : {}),
    },
    select: {
      id: true,
      title: true,
      email: true,
      phone: true,
      content: true,
      status: true,
      isPrivate: true,
      createdAt: true,
      updatedAt: true,
      processedAt: true,
      processingMemo: true,
      processedById: true,
    },
  })

  return NextResponse.json({ ok: true, item: updated })
}
