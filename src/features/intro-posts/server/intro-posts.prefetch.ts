import type { QueryClient } from "@tanstack/react-query"
import { serverApiFetch } from "@/lib/api-server"
import {
  type ApiResponseDto,
  getIntroPostSectionConfig,
  type IntroPostListDto,
  type IntroPostSectionKey,
} from "../isomorphic/intro-posts.types"

async function fetchPublicIntroPosts(section: IntroPostSectionKey) {
  const config = getIntroPostSectionConfig(section)
  const response = await serverApiFetch.get(config.publicApiPath).send()

  if (!response.ok) {
    throw new Error(`${config.publicPageTitle} 목록을 불러오지 못했습니다.`)
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<IntroPostListDto> | null

  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error(`${config.publicPageTitle} 목록을 불러오지 못했습니다.`)
  }

  return json.items
}

export async function prefetchPublicIntroPosts(
  queryClient: QueryClient,
  params: { section: IntroPostSectionKey },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "intro-posts", "list", params.section] as const,
    queryFn: () => fetchPublicIntroPosts(params.section),
    staleTime: 10_000,
  })
}
