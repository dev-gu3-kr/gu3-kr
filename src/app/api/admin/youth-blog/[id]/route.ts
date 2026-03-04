import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import type {
  ApiResponseDto,
  NoticeDetailDto,
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

async function assertAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)

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

  const item: NoticeDetailDto = {
    id: youthBlog.id,
    title: youthBlog.title,
    summary: youthBlog.summary,
    content: youthBlog.content,
    isPublished: youthBlog.isPublished,
    createdAt: youthBlog.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: NoticeDetailDto }> = { ok: true, item }
  return NextResponse.json(response)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)

  if (!author) {
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

  const { id } = await context.params

  await noticeService.updateYouthBlog({ id, ...parsed.data })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdmin(request)

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
