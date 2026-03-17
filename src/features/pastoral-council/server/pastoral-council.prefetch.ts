import type { QueryClient } from "@tanstack/react-query"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import type {
  PastoralCouncilListItemDto,
  PastoralCouncilPublicPageDto,
} from "@/features/pastoral-council/isomorphic"
import { publicPastoralCouncilQueryKeys } from "@/features/pastoral-council/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicPastoralCouncil() {
  const response = await serverApiFetch.get("/api/pastoral-council").send()
  if (!response.ok) {
    throw new Error("사목협의회 정보를 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<PastoralCouncilPublicPageDto> | null

  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error("사목협의회 정보를 불러오지 못했습니다.")
  }

  return json.items as PastoralCouncilListItemDto[]
}

export async function prefetchPublicPastoralCouncilList(
  queryClient: QueryClient,
) {
  await queryClient.prefetchQuery({
    queryKey: publicPastoralCouncilQueryKeys.lists(),
    queryFn: fetchPublicPastoralCouncil,
  })
}
