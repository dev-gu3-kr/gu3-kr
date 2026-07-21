import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import {
  type ApiResponseDto,
  createIntroPostSchema,
  type IntroPostDetailDto,
} from "@/features/intro-posts/isomorphic"
import { introPostsService } from "@/features/intro-posts/server"
import { assertAdminSession } from "@/lib/admin/session"

const SECTION = "community" as const

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

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await introPostsService.getIntroPostById(SECTION, id)

  if (!item) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const responseItem: IntroPostDetailDto = {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    content: item.content,
    sortOrder: item.sortOrder,
    isPublished: item.isPublished,
    createdAt: item.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: IntroPostDetailDto }> = {
    ok: true,
    item: responseItem,
  }

  return NextResponse.json(response)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id } = await context.params
  const detail = await introPostsService.getIntroPostById(SECTION, id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const replaceImage =
    parsed.data.imageUrl !== detail.imageUrl
      ? toImageRecordFromUrl(parsed.data.imageUrl)
      : undefined

  const updated = await introPostsService.updateIntroPost({
    section: SECTION,
    id,
    title: parsed.data.title,
    content: parsed.data.content,
    sortOrder: parsed.data.sortOrder,
    isPublished: parsed.data.isPublished,
    ...(replaceImage ? { replaceImage } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.reconcilePostImages({
    postId: id,
    content: parsed.data.content,
    explicitUrls: [replaceImage?.url ?? detail.imageUrl],
    uploadedById: author.id,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const contentImageIds = await contentImageService.preparePostDeletion(id)
  const removed = await introPostsService.removeIntroPostById(SECTION, id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.cleanupPreparedDeletion(contentImageIds)

  return NextResponse.json({ ok: true })
}
