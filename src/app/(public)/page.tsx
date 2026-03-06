import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { HomePageClient } from "@/features/home/client"
import {
  type HomePageResponseDto,
  homeQueryKeys,
} from "@/features/home/isomorphic"
import { serverApiFetch } from "@/lib/api-server"
import { getQueryClient } from "@/lib/react-query"

async function fetchHomePageData() {
  const response = await serverApiFetch.get("/api/home").send()
  if (!response.ok) {
    throw new Error("홈 화면 데이터를 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as HomePageResponseDto | null
  if (!json?.ok) {
    throw new Error("홈 화면 데이터를 불러오지 못했습니다.")
  }

  return json
}

export default async function Home() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: homeQueryKeys.page(),
    queryFn: fetchHomePageData,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  )
}
