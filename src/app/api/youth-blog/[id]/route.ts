import { NextResponse } from "next/server"
import type {
  ApiResponseDto,
  YouthBlogDetailDto,
  YouthBlogNavigationDto,
} from "@/features/youth-blog/isomorphic"
import { noticeService } from "@/features/youth-blog/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const detail =
    await noticeService.getPublishedYouthBlogDetailWithNavigation(id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "청소년 블로그를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: YouthBlogDetailDto = {
    id: detail.item.id,
    title: detail.item.title,
    thumbnailUrl: detail.item.thumbnailUrl,
    content: detail.item.content,
    isPublished: detail.item.isPublished,
    createdAt: detail.item.createdAt.toISOString(),
  }

  const navigation: YouthBlogNavigationDto = detail.navigation

  const response: ApiResponseDto<{
    item: YouthBlogDetailDto
    navigation: YouthBlogNavigationDto
  }> = {
    ok: true,
    item,
    navigation,
  }

  return NextResponse.json(response)
}
