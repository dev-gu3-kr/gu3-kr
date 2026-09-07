import { NextResponse } from "next/server"
import { photoArchiveService } from "@/features/photoArchive/server"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const item = await photoArchiveService.getPublicArchivePhoto(id)
  if (!item) {
    return NextResponse.json(
      { ok: false, message: "사진을 찾을 수 없습니다." },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, item })
}
