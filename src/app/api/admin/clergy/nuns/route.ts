// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import type { NunPageDto } from "@/features/clergy-nuns/isomorphic"
import { upsertNunSchema } from "@/features/clergy-nuns/isomorphic"
import { nunService } from "@/features/clergy-nuns/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.
function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

function mapNun(
  item: Awaited<ReturnType<typeof nunService.getNunPage>>["items"][number],
) {
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
    createdAt: item.createdAt.toISOString(),
  }
}

// 목록/상세 조회 요청을 처리한다.
export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const author = await authService.getLoginCandidateById(authorId)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor") || undefined
  const takeParam = Number(searchParams.get("take") || 10)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 30)
    : 10

  const page = await nunService.getNunPage({ take, cursor })
  const response: ApiResponseDto<NunPageDto> = {
    ok: true,
    items: page.items.map(mapNun),
    nextCursor: page.nextCursor,
  }
  return NextResponse.json(response)
}

// 생성 요청을 처리한다.
// 이미지 업로드를 받아 공용 버킷에 저장하고 URL을 반환한다.
export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const author = await authService.getLoginCandidateById(authorId)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )

  const json = await request.json().catch(() => null)
  const parsed = upsertNunSchema.safeParse(json)
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )

  const created = await nunService.createNunProfile(parsed.data)
  return NextResponse.json({ ok: true, id: created.id })
}
