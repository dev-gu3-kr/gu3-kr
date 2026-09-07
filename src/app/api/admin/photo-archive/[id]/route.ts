import { NextResponse } from "next/server"
import { updateArchivePhotoSchema } from "@/features/photoArchive/isomorphic"
import { photoArchiveService } from "@/features/photoArchive/server"
import { assertAdminSession } from "@/lib/admin/session"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: RouteContext) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const item = await photoArchiveService.getAdminArchivePhoto(id)
  if (!item) {
    return NextResponse.json(
      { ok: false, message: "사진을 찾을 수 없습니다." },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, item })
}

export async function PATCH(request: Request, context: RouteContext) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = updateArchivePhotoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message },
      { status: 400 },
    )
  }

  const { id } = await context.params
  const item = await photoArchiveService.updateArchivePhoto({
    id,
    changedById: author.id,
    ...parsed.data,
  })
  if (!item) {
    return NextResponse.json(
      { ok: false, message: "사진을 찾을 수 없습니다." },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, item })
}

export async function DELETE(request: Request, context: RouteContext) {
  const author = await assertAdminSession(request)
  if (!author) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  try {
    const result = await photoArchiveService.deleteArchivePhoto(id)
    if (!result) {
      return NextResponse.json(
        { ok: false, message: "사진을 찾을 수 없습니다." },
        { status: 404 },
      )
    }
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사진을 삭제하지 못했습니다."
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
