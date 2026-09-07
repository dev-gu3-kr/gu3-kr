import { NextResponse } from "next/server"
import { archivePhotoYearSchema } from "@/features/photoArchive/isomorphic"
import { photoArchiveService } from "@/features/photoArchive/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 60)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(Math.trunc(takeParam), 1), 100)
    : 60
  const yearParam = searchParams.get("year")
  const yearResult = yearParam
    ? archivePhotoYearSchema.safeParse(Number(yearParam))
    : null
  if (yearResult && !yearResult.success) {
    return NextResponse.json(
      { ok: false, message: yearResult.error.issues[0]?.message },
      { status: 400 },
    )
  }

  const page = await photoArchiveService.getPublicArchivePhotoPage({
    take,
    cursor: searchParams.get("cursor") || undefined,
    year: yearResult?.data,
  })
  return NextResponse.json({ ok: true, ...page })
}
