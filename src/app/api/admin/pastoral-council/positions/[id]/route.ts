import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import { upsertPastoralCouncilPositionSchema } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilService } from "@/features/pastoral-council/server"
import { getAuthorIdFromCookieHeader } from "@/lib/admin/session"

async function getSessionAuthor(request: Request) {
  const authorId = getAuthorIdFromCookieHeader(
    request.headers.get("cookie") || "",
  )
  if (!authorId) return null
  return authService.getLoginCandidateById(authorId)
}

function mapPosition(position: {
  id: string
  title: string
  parentId: string | null
  sortOrder: number
  childrenLayout: "AUTO" | "ROW" | "COLUMN" | "GRID"
  childrenColumns: number
  isActive: boolean
  defaultPlaceholderImageType: "WOMAN" | "MAN" | "NUN" | "PRIEST"
  createdAt: Date
  _count: { members: number }
}) {
  return {
    id: position.id,
    title: position.title,
    parentId: position.parentId,
    sortOrder: position.sortOrder,
    childrenLayout: position.childrenLayout,
    childrenColumns: position.childrenColumns,
    isActive: position.isActive,
    defaultPlaceholderImageType: position.defaultPlaceholderImageType,
    memberCount: position._count.members,
    createdAt: position.createdAt.toISOString(),
  }
}

// 직책 편집 다이얼로그가 사용하는 단일 직책 정보를 반환한다.
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionAuthor(request))) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  const position =
    await pastoralCouncilService.getPastoralCouncilPositionById(id)
  if (!position) {
    return NextResponse.json(
      { ok: false, message: "직책을 찾을 수 없습니다." },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, position: mapPosition(position) })
}

// 순환 관계 검증을 거쳐 직책명과 상위 직책·순서를 수정한다.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionAuthor(request))) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const parsed = upsertPastoralCouncilPositionSchema.safeParse(
    await request.json().catch(() => null),
  )
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "입력값이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const { id } = await context.params
  try {
    const position = await pastoralCouncilService.updatePastoralCouncilPosition(
      id,
      parsed.data,
    )
    if (!position) {
      return NextResponse.json(
        { ok: false, message: "직책을 찾을 수 없습니다." },
        { status: 404 },
      )
    }
    return NextResponse.json({ ok: true, position: mapPosition(position) })
  } catch (error) {
    if (error instanceof pastoralCouncilService.PastoralCouncilPositionError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 },
      )
    }
    throw error
  }
}

// 하위 직책이나 구성원이 없는 직책만 삭제한다.
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await getSessionAuthor(request))) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const { id } = await context.params
  try {
    const deleted =
      await pastoralCouncilService.removePastoralCouncilPosition(id)
    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "직책을 찾을 수 없습니다." },
        { status: 404 },
      )
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof pastoralCouncilService.PastoralCouncilPositionError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 409 },
      )
    }
    throw error
  }
}
