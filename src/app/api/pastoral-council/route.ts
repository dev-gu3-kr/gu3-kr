import { NextResponse } from "next/server"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type { PastoralCouncilPublicPageDto } from "@/features/pastoral-council/isomorphic"
import { pastoralCouncilService } from "@/features/pastoral-council/server"

function mapItem(
  item: Awaited<
    ReturnType<typeof pastoralCouncilService.getPublicPastoralCouncilList>
  >[number],
) {
  return {
    id: item.id,
    role: item.role,
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

export async function GET() {
  const items = await pastoralCouncilService.getPublicPastoralCouncilList()

  const response: ApiResponseDto<PastoralCouncilPublicPageDto> = {
    ok: true,
    items: items.map(mapItem),
  }

  return NextResponse.json(response)
}
