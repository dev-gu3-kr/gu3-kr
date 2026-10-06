import { NextResponse } from "next/server"
import { galleryPhotosService } from "@/features/galleryPhotos/server"
import { assertAdminSession } from "@/lib/admin/session"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  if (!(await assertAdminSession(request)))
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  const { id } = await context.params
  const params = new URL(request.url).searchParams
  const status = params.get("status")
  try {
    const page = await galleryPhotosService.getPhotoPage({
      postId: id,
      take: 48,
      publicOnly: false,
      cursor: params.get("cursor") || undefined,
      status:
        status === "PUBLISHED" || status === "HIDDEN" ? status : undefined,
    })
    if (!page)
      return NextResponse.json(
        { ok: false, message: "행사를 찾을 수 없습니다." },
        { status: 404 },
      )
    return NextResponse.json({ ok: true, ...page })
  } catch {
    return NextResponse.json(
      { ok: false, message: "사진 페이지를 불러오지 못했습니다." },
      { status: 400 },
    )
  }
}
