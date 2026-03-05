import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { PriestListItemDto } from "./priest.types"

// 신부님 목록 조회 key 집합이다.
// 동일 리스트에 대한 invalidate/prefetch 지점을 한 곳에서 맞춘다.
export const priestQueryKeys = {
  all: ["admin", "clergy", "priests"] as const,
  lists: () => [...priestQueryKeys.all, "list"] as const,
}

type PriestListResponseDto = { ok?: boolean; items?: PriestListItemDto[] }

// 관리자 신부님 목록 API를 호출한다.
// 에러는 throw로 전달해 뷰에서 공통 에러 상태를 처리한다.
async function fetchPriests() {
  const response = await apiFetch
    .get("/api/admin/clergy/priests")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("신부님 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PriestListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

// 신부님 목록 쿼리 훅이다.
// staleTime 동안 캐시를 재사용해 재방문 체감 속도를 높인다.
export function usePriestListQuery() {
  return useQuery({
    queryKey: priestQueryKeys.lists(),
    queryFn: fetchPriests,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}
