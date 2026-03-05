import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { PriestDetailDto, PriestListItemDto } from "./priest.types"

// 신부님 목록 조회 key 집합이다.
// 동일 리스트에 대한 invalidate/prefetch 지점을 한 곳에서 맞춘다.
export const priestQueryKeys = {
  all: ["admin", "clergy", "priests"] as const,
  lists: () => [...priestQueryKeys.all, "list"] as const,
  detail: (id: string) => [...priestQueryKeys.all, "detail", id] as const,
}

type PriestListResponseDto = { ok?: boolean; items?: PriestListItemDto[] }
type PriestDetailResponseDto = { ok?: boolean; item?: PriestDetailDto }

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

async function fetchPriestDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/clergy/priests/${id}`).send()
  if (!response.ok) throw new Error("신부님 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PriestDetailResponseDto | null
  if (!json?.ok || !json.item)
    throw new Error("신부님 상세를 불러오지 못했습니다.")
  return json.item
}

export function usePriestDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: priestQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchPriestDetail(id),
    initialData: () => {
      const cachedList = queryClient.getQueryData<PriestListItemDto[]>(
        priestQueryKeys.lists(),
      )
      const matched = cachedList?.find((item) => item.id === id)
      if (!matched) return undefined
      return { ...matched, phone: null } as PriestDetailDto
    },
  })
}
