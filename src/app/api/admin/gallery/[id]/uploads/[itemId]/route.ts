import { after, NextResponse } from "next/server"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
import { assertAdminSession } from "@/lib/admin/session"

type Context = { params: Promise<{ id: string; itemId: string }> }
export const maxDuration = 60

export async function POST(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id, itemId } = await context.params
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File))
    return NextResponse.json(
      { ok: false, message: "사진 파일을 선택해 주세요." },
      { status: 400 },
    )
  try {
    const item = await galleryPhotosService.uploadPhotoOriginal({
      postId: id,
      itemId,
      file,
    })
    after(() =>
      galleryPhotosService.processQueuedPhotos().then(() => undefined),
    )
    return NextResponse.json({ ok: true, status: item?.status })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "사진 전송에 실패했습니다.",
      },
      { status: 400 },
    )
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id, itemId } = await context.params
  const count = await galleryPhotosService.retryUploadItem(id, itemId)
  if (count)
    after(() =>
      galleryPhotosService.processQueuedPhotos().then(() => undefined),
    )
  return NextResponse.json(
    {
      ok: count > 0,
      message: count ? undefined : "재시도할 작업을 찾을 수 없습니다.",
    },
    { status: count ? 200 : 404 },
  )
}
