// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import { upsertNunSchema } from "@/features/clergy-nuns/isomorphic"
import { nunService } from "@/features/clergy-nuns/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

async function getSessionAuthor(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

function mapNun(
  item: NonNullable<Awaited<ReturnType<typeof nunService.getNunById>>>,
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
    phone: item.phone,
    imageUrl: item.imageUrl,
    isCurrent: item.isCurrent,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt.toISOString(),
  }
}

// 목록/상세 조회 요청을 처리한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await getSessionAuthor(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { id } = await context.params
  const item = await nunService.getNunById(id)
  if (!item)
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )

  return NextResponse.json({ ok: true, item: mapNun(item) })
}

// 수정 요청을 처리한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await getSessionAuthor(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const json = await request.json().catch(() => null)

  const imageOnlyPayload =
    json &&
    typeof json === "object" &&
    Object.keys(json as Record<string, unknown>).length === 1 &&
    typeof (json as { imageUrl?: unknown }).imageUrl === "string"

  if (imageOnlyPayload) {
    const { id } = await context.params
    const item = await nunService.getNunById(id)
    if (!item)
      return NextResponse.json(
        { ok: false, message: "Target not found." },
        { status: 404 },
      )

    await nunService.updateNunProfile(id, {
      name: item.name,
      baptismalName: item.baptismalName ?? undefined,
      duty: item.duty,
      feastMonth: item.feastMonth ?? undefined,
      feastDay: item.feastDay ?? undefined,
      termStart: item.termStart ? item.termStart.toISOString() : undefined,
      termEnd: item.termEnd ? item.termEnd.toISOString() : undefined,
      phone: item.phone ?? undefined,
      imageUrl: (json as { imageUrl: string }).imageUrl,
      isCurrent: item.isCurrent,
      sortOrder: item.sortOrder,
    })

    return NextResponse.json({ ok: true })
  }
  const parsed = upsertNunSchema.safeParse(json)
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )

  const { id } = await context.params
  const item = await nunService.getNunById(id)
  if (!item)
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )

  await nunService.updateNunProfile(id, parsed.data)
  return NextResponse.json({ ok: true })
}

// 삭제 요청을 처리한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await getSessionAuthor(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )

  const { id } = await context.params
  const item = await nunService.getNunById(id)
  if (!item)
    return NextResponse.json(
      { ok: false, message: "대상을 찾을 수 없습니다." },
      { status: 404 },
    )

  await nunService.removeNunProfile(id)
  return NextResponse.json({ ok: true })
}
