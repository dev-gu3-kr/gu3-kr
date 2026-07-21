import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"
import { introPostsService } from "@/features/intro-posts/server"
import { assertAdminSession } from "@/lib/admin/session"

const SECTION = "youth" as const

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
  const removed = await introPostsService.removeIntroPostImage(SECTION, id)

  if (!removed) {
    return NextResponse.json(
      { ok: false, message: "소개 항목을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  if (removed.oldImageAssetId) {
    await contentImageService.deletePendingImageById(removed.oldImageAssetId)
  }

  return NextResponse.json({ ok: true })
}
