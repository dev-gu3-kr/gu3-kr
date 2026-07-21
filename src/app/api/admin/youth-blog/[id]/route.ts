// 관리자 API 라우트: 요청 검증, 권한 확인, 서비스 호출을 통해 CRUD 계약을 제공한다.
import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import type {
  ApiResponseDto,
  YouthBlogDetailDto,
} from "@/features/youth-blog/isomorphic"
import { createYouthBlogSchema } from "@/features/youth-blog/isomorphic"
import { noticeService } from "@/features/youth-blog/server"
import { assertAdminSession } from "@/lib/admin/session"

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

// 쿠키 헤더에서 관리자 세션 식별자를 추출한다.

// 관리자 세션 유효성을 검사한다.

// 목록/상세 조회 요청을 처리한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

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

  const item: YouthBlogDetailDto = {
    id: youthBlog.id,
    title: youthBlog.title,
    thumbnailUrl: youthBlog.thumbnailUrl,
    content: youthBlog.content,
    isPublished: youthBlog.isPublished,
    createdAt: youthBlog.createdAt.toISOString(),
  }

  const response: ApiResponseDto<{ item: YouthBlogDetailDto }> = {
    ok: true,
    item,
  }
  return NextResponse.json(response)
}

// 수정 요청을 처리한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const json = await request.json().catch(() => null)
  const parsed = createYouthBlogSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const { id } = await context.params
  const detail = await noticeService.getYouthBlogById(id)

  if (!detail) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  const replaceImage =
    parsed.data.thumbnailUrl !== detail.thumbnailUrl
      ? toImageRecordFromUrl(parsed.data.thumbnailUrl)
      : undefined

  const updated = await noticeService.updateYouthBlog({
    id,
    title: parsed.data.title,
    content: parsed.data.content,
    isPublished: parsed.data.isPublished,
    ...(replaceImage ? { replaceImage } : {}),
  })

  if (!updated) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.reconcilePostImages({
    postId: id,
    content: parsed.data.content,
    explicitUrls: [replaceImage?.url ?? detail.thumbnailUrl],
    uploadedById: author.id,
  })

  return NextResponse.json({ ok: true })
}

// 삭제 요청을 처리한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const author = await assertAdminSession(request)

  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const contentImageIds = await contentImageService.preparePostDeletion(id)

  const removed = await noticeService.removeYouthBlogById(id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  await contentImageService.cleanupPreparedDeletion(contentImageIds)

  return NextResponse.json({ ok: true })
}
