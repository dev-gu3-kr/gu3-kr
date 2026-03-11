import { NextResponse } from "next/server"

import type {
  ApiResponseDto,
  NoticeDetailDto,
  NoticeNavigationDto,
} from "@/features/notices/isomorphic"
import { noticeService } from "@/features/notices/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const detail = await noticeService.getPublishedNoticeDetailWithNavigation(id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "공지사항을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: NoticeDetailDto = {
    id: detail.item.id,
    title: detail.item.title,
    summary: detail.item.summary,
    content: detail.item.content,
    isPublished: detail.item.isPublished,
    isPinned: detail.item.isPinned,
    authorName: detail.item.authorName,
    createdAt: detail.item.createdAt.toISOString(),
  }

  const navigation: NoticeNavigationDto = detail.navigation

  const response: ApiResponseDto<{
    item: NoticeDetailDto
    navigation: NoticeNavigationDto
  }> = {
    ok: true,
    item,
    navigation,
  }

  return NextResponse.json(response)
}
