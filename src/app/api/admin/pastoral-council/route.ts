import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type { PastoralCouncilPageDto } from "@/features/pastoral-council/isomorphic"
import { upsertPastoralCouncilSchema } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilService } from "@/features/pastoral-council/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

function mapItem(
  item: Awaited<
    ReturnType<typeof pastoralCouncilService.getPastoralCouncilPage>
  >["items"][number],
) {
  return {
    id: item.id,
    name: item.name,
    baptismalName: item.baptismalName,
    duty: item.duty,
    phone: item.phone,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
  }
}

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

  const created = await pastoralCouncilService.createPastoralCouncilMember(
    parsed.data,
  )
  return NextResponse.json({ ok: true, id: created.id })
}
