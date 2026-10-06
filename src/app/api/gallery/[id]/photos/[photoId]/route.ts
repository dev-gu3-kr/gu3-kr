import { NextResponse } from "next/server"
import { galleryPhotosService } from "@/features/galleryPhotos/server"

type Context = { params: Promise<{ id: string; photoId: string }> }

export async function GET(_request: Request, context: Context) {
  const { id, photoId } = await context.params
  const detail = await galleryPhotosService.getPublicPhotoDetail(id, photoId)
  return NextResponse.json(
    { ok: Boolean(detail), ...detail },
    { status: detail ? 200 : 404 },
  )
}
