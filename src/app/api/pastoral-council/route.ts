import { NextResponse } from "next/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type { PastoralCouncilPublicPageDto } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilService } from "@/features/pastoral-council/server"

function mapMember(
  item: Awaited<
    ReturnType<typeof pastoralCouncilService.getPublicPastoralCouncil>
  >["members"][number],
) {
  return {
    id: item.id,
    positionId: item.positionId,
    positionTitle: item.position.title,
    name: item.name,
    baptismalName: item.baptismalName,
    phone: item.phone,
    imageUrl: item.imageUrl,
    placeholderImageType: item.placeholderImageType,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
  }
}

function mapPosition(
  position: Awaited<
    ReturnType<typeof pastoralCouncilService.getPublicPastoralCouncil>
  >["positions"][number],
) {
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

export async function GET() {
  const result = await pastoralCouncilService.getPublicPastoralCouncil()
  const response: ApiResponseDto<PastoralCouncilPublicPageDto> = {
    ok: true,
    positions: result.positions.map(mapPosition),
    members: result.members.map(mapMember),
  }

  return NextResponse.json(response)
}
