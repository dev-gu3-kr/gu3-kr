import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import type {
  ApiResponseDto,
  NoticeDetailDto,
} from "@/features/notices/isomorphic"
import { createNoticeSchema } from "@/features/notices/isomorphic"
import { noticeService } from "@/features/notices/server"

function getAuthorIdFromCookieHeader(cookieHeader: string) {
  // Cookie 헤더에서 관리자 세션 값을 추출한다.
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .find((token) => token.startsWith(`${ADMIN_SESSION_COOKIE_KEY}=`))
    ?.split("=")[1]
}

async function assertAdmin(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const authorId = getAuthorIdFromCookieHeader(cookieHeader)

  if (!authorId) {
    return null
  }

  return authService.getLoginCandidateById(authorId)
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 관리자 인증을 확인한다.
  const author = await assertAdmin(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const notice = await noticeService.getNoticeById(id)

  if (!notice) {
    return NextResponse.json(
      { ok: false, message: "공지사항을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: NoticeDetailDto = {
    id: notice.id,
    title: notice.title,
    summary: notice.summary,
    content: notice.content,
    isPublished: notice.isPublished,
    createdAt: notice.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: NoticeDetailDto }> = {
    ok: true,
    item,
  }

  return NextResponse.json(response)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 관리자 인증을 확인한다.
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

  await noticeService.updateNotice({
    id,
    ...parsed.data,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  // 관리자 인증을 확인한다.
  const author = await assertAdmin(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params

  await noticeService.removeNoticeById(id)

  return NextResponse.json({ ok: true })
}
