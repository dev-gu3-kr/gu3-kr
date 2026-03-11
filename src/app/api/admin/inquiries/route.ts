import { NextResponse } from "next/server"

import { authService } from "@/features/auth/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"
import { prisma } from "@/lib/prisma"

type InquiryStatusFilter = "all" | "RECEIVED" | "IN_PROGRESS" | "DONE"

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
  const cursor = searchParams.get("cursor") || undefined
  const q = searchParams.get("q")?.trim() || ""
  const status =
    (searchParams.get("status") as InquiryStatusFilter | null) ?? "all"
  const takeParam = Number(searchParams.get("take") || 10)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 30)
    : 10

  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { processingMemo: { contains: q } },
          ],
        }
      : {}),
  }

  const rows = await prisma.inquiry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      title: true,
      email: true,
      phone: true,
      content: true,
      processingMemo: true,
      status: true,
      isPrivate: true,
      createdAt: true,
    },
  })

  const hasNextPage = rows.length > take
  const items = (hasNextPage ? rows.slice(0, take) : rows).map((row) => ({
    ...row,
    summary: row.content.slice(0, 80),
    processingMemo: row.processingMemo ?? null,
  }))

  return NextResponse.json({
    ok: true,
    items,
    nextCursor: hasNextPage ? (items[items.length - 1]?.id ?? null) : null,
  })
}
