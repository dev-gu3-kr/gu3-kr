import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { prisma } from "@/lib/prisma"

// 관리자 세션 쿠키에서 작성자 식별자를 추출한다.
function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

async function assertAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

export async function GET(request: Request) {
  const author = await assertAdmin(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 30)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 100)
    : 30
  const cursor = searchParams.get("cursor") || undefined
  const query = (searchParams.get("query") || "").trim()
  const status = searchParams.get("status")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  // 목록 API는 리스트/스케줄러를 모두 지원하므로 from/to 유무에 따라 정렬 기준을 분기한다.
  const rows = await prisma.event.findMany({
    where: {
      ...(query
        ? {
            title: {
              contains: query,
            },
          }
        : {}),
      ...(status === "published"
        ? { isPublished: true }
        : status === "draft"
          ? { isPublished: false }
          : {}),
      ...(from || to
        ? {
            startsAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy:
      from || to
        ? [{ startsAt: "asc" }, { id: "desc" }]
        : [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
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

  // take+1 조회로 다음 페이지 존재 여부를 계산한다.
  const hasMore = rows.length > take
  const items = hasMore ? rows.slice(0, take) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : null

  return NextResponse.json({
    ok: true,
    items,
    pageInfo: { hasMore, nextCursor, take },
  })
}

export async function POST(request: Request) {
  const author = await assertAdmin(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
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

  if (endsAt < startsAt) {
    return NextResponse.json(
      { ok: false, message: "종료일은 시작일보다 빠를 수 없습니다." },
      { status: 400 },
    )
  }

  const created = await prisma.event.create({
    data: {
      title,
      description,
      startsAt,
      endsAt,
      isPublished,
      createdById: author.id,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: created.id })
}
