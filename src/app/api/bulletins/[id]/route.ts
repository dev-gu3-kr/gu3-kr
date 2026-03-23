import { NextResponse } from "next/server"
import type {
  ApiResponseDto,
  BulletinNavigationDto,
  BulletinPublicDetailDto,
} from "@/features/bulletins/isomorphic"
import { bulletinService } from "@/features/bulletins/server"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const detail =
    await bulletinService.getPublishedBulletinDetailWithNavigation(id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "본당주보를 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const item: BulletinPublicDetailDto = {
    id: detail.item.id,
    title: detail.item.title,
    content: detail.item.content,
    authorName: detail.item.authorName,
    createdAt: detail.item.createdAt.toISOString(),
    attachments: detail.item.attachments,
  }

  const navigation: BulletinNavigationDto = detail.navigation

  const response: ApiResponseDto<{
    item: BulletinPublicDetailDto
    navigation: BulletinNavigationDto
  }> = {
    ok: true,
    item,
    navigation,
  }

  return NextResponse.json(response)
}
