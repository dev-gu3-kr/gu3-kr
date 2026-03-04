import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import type {
  ApiResponseDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "@/features/youth-blog/isomorphic"
import { createNoticeSchema } from "@/features/youth-blog/isomorphic"
import { noticeService } from "@/features/youth-blog/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get("cursor") || undefined
  const q = searchParams.get("q")?.trim() || undefined
  const status = (searchParams.get("status") || "all") as NoticePublishFilterDto
  const takeParam = Number(searchParams.get("take") || 10)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(takeParam, 1), 30)
    : 10

  const isPublished =
    status === "published" ? true : status === "draft" ? false : undefined

  const page = await noticeService.getYouthBlogPage({
    take,
    cursor,
    query: q,
    isPublished,
  })

  const response: ApiResponseDto<NoticePageDto> = { ok: true, ...page }
  return NextResponse.json(response)
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = createNoticeSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )
  }

  const created = await noticeService.createYouthBlog({
    ...parsed.data,
    authorId,
  })

  return NextResponse.json({ ok: true, id: created.id })
}
