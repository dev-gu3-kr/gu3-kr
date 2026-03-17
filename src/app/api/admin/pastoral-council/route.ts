// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.

import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type { PastoralCouncilPageDto } from "@/features/pastoral-council/isomorphic"
import { upsertPastoralCouncilSchema } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilService } from "@/features/pastoral-council/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

function mapItem(
  item: Awaited<
    ReturnType<typeof pastoralCouncilService.getPastoralCouncilPage>
  >["items"][number],
) {
  return {
    id: item.id,
    role: item.role,
    name: item.name,
    baptismalName: item.baptismalName,
    phone: item.phone,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
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

  const page = await pastoralCouncilService.getPastoralCouncilPage({
    take,
    cursor,
  })
  const response: ApiResponseDto<PastoralCouncilPageDto> = {
    ok: true,
    items: page.items.map(mapItem),
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
  const parsed = upsertPastoralCouncilSchema.safeParse(json)
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )

  try {
    const created = await pastoralCouncilService.createPastoralCouncilMember(
      parsed.data,
    )
    return NextResponse.json({ ok: true, id: created.id })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, message: "이미 등록된 직책입니다." },
        { status: 409 },
      )
    }

    throw error
  }
}
