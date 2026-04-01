import { NextResponse } from "next/server"
import {
  type ApiResponseDto,
  createIntroPostSchema,
} from "@/features/intro-posts/isomorphic"
import { introPostsService } from "@/features/intro-posts/server"
import { assertAdminSession } from "@/lib/admin/session"

const SECTION = "youth" as const

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

export async function GET(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const items = await introPostsService.getIntroPosts({
    section: SECTION,
  })

  const response: ApiResponseDto<{ items: typeof items }> = {
    ok: true,
    items,
  }

  return NextResponse.json(response)
}

export async function POST(request: Request) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = createIntroPostSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const created = await introPostsService.createIntroPost({
    section: SECTION,
    authorId: author.id,
    title: parsed.data.title,
    content: parsed.data.content,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
    imageRecord: toImageRecordFromUrl(parsed.data.imageUrl),
  })

  return NextResponse.json({ ok: true, id: created.id })
}
