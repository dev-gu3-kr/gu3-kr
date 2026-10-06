import { NextResponse } from "next/server"
import { galleryPhotosService } from "@/features/galleryPhotos/server"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  const { id } = await context.params
  const cursor = new URL(request.url).searchParams.get("cursor") || undefined
  try {
    const page = await galleryPhotosService.getPhotoPage({
      postId: id,
      take: 48,
      publicOnly: true,
      cursor,
    })
    return NextResponse.json(
      { ok: Boolean(page), ...page },
      { status: page ? 200 : 404 },
    )
  } catch {
    return NextResponse.json(
      { ok: false, message: "사진 페이지가 올바르지 않습니다." },
      { status: 400 },
    )
  }
}
