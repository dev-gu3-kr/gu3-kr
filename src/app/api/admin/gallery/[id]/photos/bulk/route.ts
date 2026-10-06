import { NextResponse } from "next/server"
import { galleryPhotoBulkSchema } from "@/features/galleryPhotos/isomorphic"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
import { assertAdminSession } from "@/lib/admin/session"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id } = await context.params
  const parsed = galleryPhotoBulkSchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsed.success)
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  const result = await galleryPhotosService.updatePhotoStatuses(
    id,
    parsed.data.photoIds,
    parsed.data.status,
  )
  return NextResponse.json({ ok: true, count: result.count })
}
