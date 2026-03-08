import { NextResponse } from "next/server"
import type {
  NunApiResponseDto,
  NunPageDto,
} from "@/features/clergy-nuns/isomorphic"
import { nunService } from "@/features/clergy-nuns/server"

function mapNun(
  item: Awaited<ReturnType<typeof nunService.getNunPage>>["items"][number],
) {
  // DB 모델을 공개 API 응답 DTO로 직렬화한다.
  // 날짜는 클라이언트/서버 모두에서 안전하게 쓰도록 ISO 문자열로 통일한다.
  return {
    id: item.id,
    name: item.name,
    baptismalName: item.baptismalName,
    duty: item.duty,
    feastMonth: item.feastMonth,
    feastDay: item.feastDay,
    termStart: item.termStart ? item.termStart.toISOString() : null,
    termEnd: item.termEnd ? item.termEnd.toISOString() : null,
    isCurrent: item.isCurrent,
    sortOrder: item.sortOrder,
    imageUrl: item.imageUrl,
    phone: item.phone,
    createdAt: item.createdAt.toISOString(),
  }
}

export async function GET() {
  // 공개 소개 페이지는 현재/이전 수녀님을 함께 보여주므로 충분한 개수로 한 번에 조회한다.
  const page = await nunService.getNunPage({ take: 100 })

  const response: NunApiResponseDto<NunPageDto> = {
    ok: true,
    items: page.items.map(mapNun),
    nextCursor: page.nextCursor,
  }

  return NextResponse.json(response)
}
