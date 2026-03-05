import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import type {
  ApiResponseDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "@/features/notices/isomorphic"
import { createNoticeSchema } from "@/features/notices/isomorphic"
import { noticeService } from "@/features/notices/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

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

  // cursor/take/status/q 쿼리를 파싱해 페이지를 조회한다.
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

  const page = await noticeService.getNoticePage({
    take,
    cursor,
    query: q,
    isPublished,
  })

  const response: ApiResponseDto<NoticePageDto> = { ok: true, ...page }
  return NextResponse.json(response)
}

export async function POST(request: Request) {
  // Cookie 헤더에서 관리자 세션 값을 추출한다.
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  // 요청 본문(JSON)을 파싱한다.
  const json = await request.json().catch(() => null)

  // 공지 작성 입력값을 스키마로 검증한다.
  const parsed = createNoticeSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  // 관리자 계정 존재 여부를 확인한다.
  const author = await authService.getLoginCandidateById(authorId)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "유효하지 않은 세션입니다." },
      { status: 401 },
    )
  }

  // 공지사항 레코드를 생성한다.
  const created = await noticeService.createNotice({
    ...parsed.data,
    authorId,
  })

  return NextResponse.json({ ok: true, id: created.id })
}
