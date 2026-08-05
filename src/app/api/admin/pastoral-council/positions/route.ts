import { NextResponse } from "next/server"
import { authService } from "@/features/auth/server"
import type { PastoralCouncilPositionDto } from "@/features/pastoral-council/isomorphic"
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

function mapPosition(
  position: Awaited<
    ReturnType<typeof pastoralCouncilService.getPastoralCouncilPositions>
  >[number],
): PastoralCouncilPositionDto {
  return {
    id: position.id,
    title: position.title,
    parentId: position.parentId,
    sortOrder: position.sortOrder,
    isActive: position.isActive,
    defaultPlaceholderImageType: position.defaultPlaceholderImageType,
    memberCount: position._count.members,
    createdAt: position.createdAt.toISOString(),
  }
}

// 직책 트리 편집 화면이 사용하는 전체 직책 목록을 반환한다.
export async function GET(request: Request) {
  if (!(await getSessionAuthor(request))) {
    return NextResponse.json(
      { ok: false, message: "로그인이 필요합니다." },
      { status: 401 },
    )
  }

  const positions = await pastoralCouncilService.getPastoralCouncilPositions()
  return NextResponse.json({
    ok: true,
    positions: positions.map(mapPosition),
  })
}

// 입력을 검증한 뒤 새로운 직책 노드를 생성한다.
export async function POST(request: Request) {
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

  try {
    const position = await pastoralCouncilService.createPastoralCouncilPosition(
      parsed.data,
    )
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
