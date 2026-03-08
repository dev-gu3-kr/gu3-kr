import type { QueryClient } from "@tanstack/react-query"
import {
  type PriestApiResponseDto,
  type PriestListItemDto,
  publicPriestQueryKeys,
} from "@/features/clergy-priests/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicPriests() {
  const response = await serverApiFetch.get("/api/clergy/priests").send()
  if (!response.ok) {
    throw new Error("신부님 소개를 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as PriestApiResponseDto<{
    items: PriestListItemDto[]
  }> | null

  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error("신부님 소개를 불러오지 못했습니다.")
  }

  return json.items
}

// 공개 신부님 소개 화면을 SSR hydration 하기 위한 prefetch다.
// page.tsx 에서는 service 직접 호출 대신 이 진입점만 사용한다.
export async function prefetchPublicPriestList(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: publicPriestQueryKeys.lists(),
    queryFn: fetchPublicPriests,
  })
}
