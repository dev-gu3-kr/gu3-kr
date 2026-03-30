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

function toImageRecordFromUrl(url: string) {
  const fileName = url.split("/").pop() || `${Date.now()}.webp`
  return {
    fileName,
    originalName: fileName,
    mimeType: "image/webp",
    sizeBytes: 0,
    url,
    isCover: true,
    sortOrder: 0,
  }
}

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 목록 조회 요청을 처리한다.
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

  const response = { ok: true, ...page }
  return NextResponse.json(response)
}

// 새 청소년 블로그 생성 요청을 처리한다.
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
    authorId,
    title: parsed.data.title,
    content: parsed.data.content,
    isPublished: parsed.data.isPublished,
    imageRecord: toImageRecordFromUrl(parsed.data.thumbnailUrl),
  })

  return NextResponse.json({ ok: true, id: created.id })
}
