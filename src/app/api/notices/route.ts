import { NextResponse } from "next/server"

import type {
  ApiResponseDto,
  NoticePublicPageDto,
} from "@/features/notices/isomorphic"
import { noticeService } from "@/features/notices/server"

const PAGE_SIZE = 10

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const pageParam = Number(searchParams.get("page") || "1")
  const currentPage = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1
  const query = searchParams.get("q")?.trim() || undefined

  const totalCount = await noticeService.getNoticeCount({
    query,
    isPublished: true,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const items = await noticeService.getNoticePageByOffset({
    take: PAGE_SIZE,
    skip: (safePage - 1) * PAGE_SIZE,
    query,
    isPublished: true,
  })

  const response: ApiResponseDto<NoticePublicPageDto> = {
    ok: true,
    items,
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: PAGE_SIZE,
  }

  return NextResponse.json(response)
}
