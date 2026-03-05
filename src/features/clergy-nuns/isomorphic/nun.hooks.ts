import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { NunDetailDto, NunListItemDto } from "./nun.types"

// 수녀님 목록 조회 key 집합이다.
// 목록 화면/무효화 로직이 같은 key를 공유하도록 중앙에서 관리한다.
export const nunQueryKeys = {
  all: ["admin", "clergy", "nuns"] as const,
  lists: () => [...nunQueryKeys.all, "list"] as const,
  detail: (id: string) => [...nunQueryKeys.all, "detail", id] as const,
}

type NunListResponseDto = { ok?: boolean; items?: NunListItemDto[] }
type NunDetailResponseDto = { ok?: boolean; item?: NunDetailDto }

// 관리자 수녀님 목록 API를 호출한다.
// 실패는 throw로 위임해 React Query가 에러 상태를 표준 처리하도록 한다.
async function fetchNuns() {
  const response = await apiFetch
    .get("/api/admin/clergy/nuns")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("수녀님 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as NunListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

// 수녀님 목록 쿼리 훅이다.
// 이전 데이터를 placeholder로 유지해 재방문/필터 전환 시 깜빡임을 줄인다.
export function useNunListQuery() {
  return useQuery({
    queryKey: nunQueryKeys.lists(),
    queryFn: fetchNuns,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

async function fetchNunDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/clergy/nuns/${id}`).send()
  if (!response.ok) throw new Error("수녀님 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as NunDetailResponseDto | null
  if (!json?.ok || !json.item)
    throw new Error("수녀님 상세를 불러오지 못했습니다.")
  return json.item
}

export function useNunDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: nunQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchNunDetail(id),
    initialData: () => {
      const cachedList = queryClient.getQueryData<NunListItemDto[]>(
        nunQueryKeys.lists(),
      )
      const matched = cachedList?.find((item) => item.id === id)
      if (!matched) return undefined
      return { ...matched, phone: null } as NunDetailDto
    },
  })
}
