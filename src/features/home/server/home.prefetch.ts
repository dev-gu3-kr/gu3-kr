import type { QueryClient } from "@tanstack/react-query"

import {
  type HomePageResponseDto,
  homeQueryKeys,
} from "@/features/home/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

function formatMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0")

  return `${date.getFullYear()}-${month}`
}

async function fetchHomePageData(monthKey: string) {
  const response = await serverApiFetch
    .get(`/api/home?month=${encodeURIComponent(monthKey)}`)
    .send()
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

export async function prefetchHomePage(
  queryClient: QueryClient,
  now = new Date(),
) {
  const initialMonthKey = formatMonthKey(now)

  await queryClient.prefetchQuery({
    queryKey: homeQueryKeys.page(initialMonthKey),
    queryFn: () => fetchHomePageData(initialMonthKey),
  })
}
