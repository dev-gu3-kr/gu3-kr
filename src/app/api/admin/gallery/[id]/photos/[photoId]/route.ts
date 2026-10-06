import { NextResponse } from "next/server"
import { galleryPhotoUpdateSchema } from "@/features/galleryPhotos/isomorphic"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
import { assertAdminSession } from "@/lib/admin/session"

type Context = { params: Promise<{ id: string; photoId: string }> }

export async function PATCH(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id, photoId } = await context.params
  const parsed = galleryPhotoUpdateSchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  const result = await galleryPhotosService.updatePhoto(
    id,
    photoId,
    parsed.data,
  )
  return NextResponse.json(
    {
      ok: result.count > 0,
      message: result.count ? undefined : "사진을 찾을 수 없습니다.",
    },
    { status: result.count ? 200 : 404 },
  )
}

export async function DELETE(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id, photoId } = await context.params
  const result = await galleryPhotosService.deletePhoto(id, photoId)
  return NextResponse.json(
    { ok: Boolean(result), ...result },
    { status: result ? 200 : 404 },
  )
}
