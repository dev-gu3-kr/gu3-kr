import { NextResponse } from "next/server"
import { z } from "zod"

import { authService } from "@/features/auth/server"
import { inquiryService } from "@/features/inquiries/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

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
  const inquiry = await inquiryService.getInquiryById(id)

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

  const updated = await inquiryService.updateInquiry({
    id,
    status: parsed.data.status,
    note: parsed.data.note,
    processedById: auth.authorId,
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "문의를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item: updated })
}
