import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
export const maxDuration = 60
export const runtime = "nodejs"

// 외부 스케줄러는 비밀키 검증 후에만 중단된 변환과 삭제 대기 파일을 복구한다.
export async function POST(request: Request) {
  const secret =
    process.env.GALLERY_PHOTO_WORKER_SECRET ??
    process.env.CONTENT_IMAGE_CLEANUP_SECRET
  if (!secret)
    return NextResponse.json(
      { ok: false, message: "작업 비밀키가 설정되지 않았습니다." },
      { status: 503 },
    )
  const actual = Buffer.from(request.headers.get("authorization") ?? "")
  const expected = Buffer.from(`Bearer ${secret}`)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return NextResponse.json({ ok: false }, { status: 401 })
  const processing = await galleryPhotosService.processQueuedPhotos()
  const cleanup = await galleryPhotosService.cleanupGalleryAssets()
  return NextResponse.json(
    { ok: cleanup.failed === 0, ...processing, cleanup },
    { status: cleanup.failed ? 500 : 200 },
  )
}
