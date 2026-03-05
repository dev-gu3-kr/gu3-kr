// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import type {
  ApiResponseDto,
  YouthBlogPageDto,
  YouthBlogPublishFilterDto,
} from "@/features/youth-blog/isomorphic"
import { createYouthBlogSchema } from "@/features/youth-blog/isomorphic"
import { noticeService } from "@/features/youth-blog/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 목록/상세 조회 요청을 처리한다.
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
  const status = (searchParams.get("status") ||
    "all") as YouthBlogPublishFilterDto
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

  const response: ApiResponseDto<YouthBlogPageDto> = { ok: true, ...page }
  return NextResponse.json(response)
}

// 생성 요청을 처리한다.
// 이미지 업로드를 받아 공용 버킷에 저장하고 URL을 반환한다.
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
  const parsed = createYouthBlogSchema.safeParse(json)

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
