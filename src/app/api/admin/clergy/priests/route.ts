import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import type { PriestPageDto } from "@/features/clergy-priests/isomorphic"
import { upsertPriestSchema } from "@/features/clergy-priests/isomorphic"
import { priestService } from "@/features/clergy-priests/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

function mapPriest(
  item: Awaited<
    ReturnType<typeof priestService.getPriestPage>
  >["items"][number],
) {
  // DB 모델을 API 응답 DTO로 직렬화한다.
  return {
    id: item.id,
    name: item.name,
    baptismalName: item.baptismalName,
    duty: item.duty,
    feastMonth: item.feastMonth,
    feastDay: item.feastDay,
    termStart: item.termStart ? item.termStart.toISOString() : null,
    termEnd: item.termEnd ? item.termEnd.toISOString() : null,
    isCurrent: item.isCurrent,
    sortOrder: item.sortOrder,
    imageUrl: item.imageUrl,
    phone: item.phone,
    createdAt: item.createdAt.toISOString(),
  }
}

export async function GET(request: Request) {
  // 목록 조회도 관리자 인증을 요구한다.
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )
  }

  // cursor/take 쿼리를 파싱해 페이지를 조회한다.
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor") || undefined
  const takeParam = Number(searchParams.get("take") || 10)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 30)
    : 10

  const page = await priestService.getPriestPage({ take, cursor })
  const response: ApiResponseDto<PriestPageDto> = {
    ok: true,
    items: page.items.map(mapPriest),
    nextCursor: page.nextCursor,
  }

  return NextResponse.json(response)
}

export async function POST(request: Request) {
  // 생성 요청도 관리자 인증을 요구한다.
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )
  }

  // 요청 본문(JSON)을 파싱한다.
  const json = await request.json().catch(() => null)
  // 작성 입력값을 스키마로 검증한다.
  const parsed = upsertPriestSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const created = await priestService.createPriestProfile(parsed.data)

  return NextResponse.json({ ok: true, id: created.id })
}
