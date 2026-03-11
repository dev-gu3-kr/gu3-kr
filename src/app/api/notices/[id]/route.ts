import { NextResponse } from "next/server"

import type {
  ApiResponseDto,
  NoticeDetailDto,
} from "@/features/notices/isomorphic"
import { noticeService } from "@/features/notices/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const notice = await noticeService.getPublishedNoticeById(id)

  if (!notice) {
    return NextResponse.json(
      { ok: false, message: "공지사항을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: NoticeDetailDto = {
    id: notice.id,
    title: notice.title,
    summary: notice.summary,
    content: notice.content,
    isPublished: notice.isPublished,
    isPinned: notice.isPinned,
    createdAt: notice.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: NoticeDetailDto }> = { ok: true, item }

  return NextResponse.json(response)
}
