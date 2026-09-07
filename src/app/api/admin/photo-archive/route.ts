import { NextResponse } from "next/server"
import { archivePhotoYearSchema } from "@/features/photoArchive/isomorphic"
import { photoArchiveService } from "@/features/photoArchive/server"
import { assertAdminSession } from "@/lib/admin/session"

const ADMIN_STATUSES = new Set(["PUBLISHED", "HIDDEN"])

export async function GET(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const takeParam = Number(searchParams.get("take") || 40)
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(Math.trunc(takeParam), 1), 100)
    : 40
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
  const statusParam = searchParams.get("status")
  const status =
    statusParam && ADMIN_STATUSES.has(statusParam)
      ? (statusParam as "PUBLISHED" | "HIDDEN")
      : undefined

  const page = await photoArchiveService.getAdminArchivePhotoPage({
    take,
    cursor: searchParams.get("cursor") || undefined,
    year: yearResult?.data,
    status,
  })
  return NextResponse.json({ ok: true, ...page })
}

export async function POST(request: Request) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")
  const yearResult = archivePhotoYearSchema.safeParse(
    Number(formData.get("year")),
  )
  if (!(file instanceof File) || !yearResult.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          yearResult.error?.issues[0]?.message ?? "사진 파일을 선택해 주세요.",
      },
      { status: 400 },
    )
  }

  try {
    const result = await photoArchiveService.uploadArchivePhoto({
      file,
      year: yearResult.data,
      uploadedById: author.id,
    })
    if (result.duplicate) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 409 },
      )
    }
    return NextResponse.json({ ok: true, item: result.item })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사진 업로드에 실패했습니다."
    const status = message.includes("설정이 비어") ? 500 : 400
    return NextResponse.json({ ok: false, message }, { status })
  }
}
