"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import { homeQueryKeys } from "./home.query"
import type { HomePageResponseDto } from "./types"

async function fetchHomePageData() {
  const response = await apiFetch.get("/api/home").send()
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

export function useHomePageQuery() {
  return useQuery({
    queryKey: homeQueryKeys.page(),
    queryFn: fetchHomePageData,
  })
}
