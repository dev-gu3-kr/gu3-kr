import { after, NextResponse } from "next/server"
import {
  type GalleryUploadItemDto,
  galleryUploadBatchSchema,
} from "@/features/galleryPhotos/isomorphic"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
import { assertAdminSession } from "@/lib/admin/session"

type Context = { params: Promise<{ id: string }> }

export const maxDuration = 60

export async function GET(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id } = await context.params
  if (!(await galleryPhotosService.findGalleryPost(id)))
    return NextResponse.json(
      { ok: false, message: "행사를 찾을 수 없습니다." },
      { status: 404 },
    )
  const items: GalleryUploadItemDto[] =
    await galleryPhotosService.findUploadItems(id)
  if (items.some((item) => ["QUEUED", "PROCESSING"].includes(item.status)))
    after(() =>
      galleryPhotosService.processQueuedPhotos().then(() => undefined),
    )
  return NextResponse.json({ ok: true, items })
}

export async function POST(request: Request, context: Context) {
  const author = await assertAdminSession(request)
  if (!author)
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id } = await context.params
  const parsed = galleryUploadBatchSchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  try {
    const batch = await galleryPhotosService.createUploadBatch({
      ...parsed.data,
      postId: id,
      uploadedById: author.id,
    })
    return NextResponse.json({ ok: true, batchId: batch.id })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "업로드를 시작하지 못했습니다.",
      },
      { status: 400 },
    )
  }
}
