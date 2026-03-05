// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { NextResponse } from "next/server"
import type {
  ApiResponseDto,
  YouthBlogDetailDto,
} from "@/features/youth-blog/isomorphic"
import { createYouthBlogSchema } from "@/features/youth-blog/isomorphic"
import { noticeService } from "@/features/youth-blog/server"
import { assertAdminSession } from "@/lib/admin/session"

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 관리자 세션 유효성을 검사한다.

// 목록/상세 조회 요청을 처리한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const youthBlog = await noticeService.getYouthBlogById(id)

  if (!youthBlog) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: YouthBlogDetailDto = {
    id: youthBlog.id,
    title: youthBlog.title,
    summary: youthBlog.summary,
    content: youthBlog.content,
    isPublished: youthBlog.isPublished,
    createdAt: youthBlog.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: YouthBlogDetailDto }> = {
    ok: true,
    item,
  }
  return NextResponse.json(response)
}

// 수정 요청을 처리한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
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

  const { id } = await context.params

  await noticeService.updateYouthBlog({ id, ...parsed.data })

  return NextResponse.json({ ok: true })
}

// 삭제 요청을 처리한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params

  await noticeService.removeYouthBlogById(id)

  return NextResponse.json({ ok: true })
}
