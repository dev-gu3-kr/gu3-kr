import { NextResponse } from "next/server"
import type {
  PriestApiResponseDto,
  PriestPageDto,
} from "@/features/clergy-priests/isomorphic"
import { priestService } from "@/features/clergy-priests/server"

function mapPriest(
  item: Awaited<
    ReturnType<typeof priestService.getPriestPage>
  >["items"][number],
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
  // 공개 소개 페이지는 현재/역임 사제를 함께 보여주므로 충분한 개수로 한 번에 조회한다.
  const page = await priestService.getPriestPage({ take: 100 })

  const response: PriestApiResponseDto<PriestPageDto> = {
    ok: true,
    items: page.items.map(mapPriest),
    nextCursor: page.nextCursor,
  }

  return NextResponse.json(response)
}
