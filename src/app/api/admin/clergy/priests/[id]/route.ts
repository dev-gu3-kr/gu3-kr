import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { upsertPriestSchema } from "@/features/clergy-priests/isomorphic"
import { priestService } from "@/features/clergy-priests/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  // Cookie 헤더에서 관리자 세션 값을 추출한다.
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

async function getSessionAuthor(request: Request) {
  // 요청 쿠키를 바탕으로 로그인 사용자 정보를 확인한다.
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return null
  }

  return authService.getLoginCandidateById(authorId)
}

function mapPriest(
  item: NonNullable<Awaited<ReturnType<typeof priestService.getPriestById>>>,
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
    phone: item.phone,
    imageUrl: item.imageUrl,
    isCurrent: item.isCurrent,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 상세 조회도 관리자 인증을 요구한다.
  const author = await getSessionAuthor(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await priestService.getPriestById(id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.json({ ok: true, item: mapPriest(item) })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 수정 요청도 관리자 인증을 요구한다.
  const author = await getSessionAuthor(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = upsertPriestSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const { id } = await context.params
  const item = await priestService.getPriestById(id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await priestService.updatePriestProfile(id, parsed.data)

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 삭제 요청도 관리자 인증을 요구한다.
  const author = await getSessionAuthor(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await priestService.getPriestById(id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await priestService.removePriestProfile(id)

  return NextResponse.json({ ok: true })
}
