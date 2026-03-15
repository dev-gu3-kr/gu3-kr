import { NextResponse } from "next/server"

import { authService } from "@/features/auth/server"
import { inquiryService } from "@/features/inquiries/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

type InquiryStatusFilter = "all" | "RECEIVED" | "IN_PROGRESS" | "DONE"
type InquiryTypeFilter =
  | "all"
  | "MASS_SACRAMENT"
  | "CATECHUMEN_CLASS"
  | "FAITH_PARISH_LIFE"
  | "FACILITY_RENTAL"
  | "WEBSITE_ONLINE"
  | "VOLUNTEER_DONATION"
  | "OTHER"

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 10)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 30)
    : 10

  const page = await inquiryService.getInquiryPage({
    take,
    cursor: searchParams.get("cursor") || undefined,
    query: searchParams.get("q")?.trim() || "",
    status: ((searchParams.get("status") as InquiryStatusFilter | null) ??
      "all") as InquiryStatusFilter,
    inquiryType: ((searchParams.get(
      "inquiryType",
    ) as InquiryTypeFilter | null) ?? "all") as InquiryTypeFilter,
  })

  return NextResponse.json({ ok: true, ...page })
}
