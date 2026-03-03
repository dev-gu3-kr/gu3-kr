import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import { upsertNunSchema } from "@/features/clergy-nuns/isomorphic"
import { nunService } from "@/features/clergy-nuns/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

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
