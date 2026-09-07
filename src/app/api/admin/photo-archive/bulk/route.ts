import { NextResponse } from "next/server"
import { bulkArchivePhotoSchema } from "@/features/photoArchive/isomorphic"
import { photoArchiveService } from "@/features/photoArchive/server"
import { assertAdminSession } from "@/lib/admin/session"

export async function POST(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = bulkArchivePhotoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  }

  const count = await photoArchiveService.runBulkArchivePhotoAction({
    ids: parsed.data.photoIds,
    action: parsed.data.action,
    year: parsed.data.year,
    status: parsed.data.status,
    changedById: author.id,
  })
  return NextResponse.json({ ok: true, count })
}
