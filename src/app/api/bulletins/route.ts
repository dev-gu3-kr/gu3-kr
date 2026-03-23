import { NextResponse } from "next/server"
import type {
  ApiResponseDto,
  BulletinPublicPageDto,
} from "@/features/bulletins/isomorphic"
import { bulletinPublicListQuerySchema } from "@/features/bulletins/isomorphic"
import { bulletinService } from "@/features/bulletins/server"

const PAGE_SIZE = 10

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = bulletinPublicListQuerySchema.safeParse({
    page: searchParams.get("page") || "1",
    q: searchParams.get("q") || undefined,
  })

  const currentPage = parsed.success ? parsed.data.page : 1
  const query = parsed.success ? parsed.data.q : undefined

  const totalCount = await bulletinService.getBulletinCount({
    query,
    isPublished: true,
  })

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const items = await bulletinService.getBulletinPageByOffset({
    take: PAGE_SIZE,
    skip: (safePage - 1) * PAGE_SIZE,
    query,
    isPublished: true,
  })

  const response: ApiResponseDto<BulletinPublicPageDto> = {
    ok: true,
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      authorName: item.authorName,
      createdAt: item.createdAt.toISOString(),
      attachments: item.attachments,
    })),
    totalCount,
    totalPages,
    currentPage: safePage,
    pageSize: PAGE_SIZE,
  }

  return NextResponse.json(response)
}
