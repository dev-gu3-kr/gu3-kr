import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  PriestApiResponseDto,
  PriestDetailDto,
  PriestListItemDto,
} from "./priest.types"

// 신부님 목록 조회 key 집합이다.
// 동일 리스트에 대한 invalidate/prefetch 지점을 한 곳에서 맞춘다.
export const priestQueryKeys = {
  all: ["admin", "clergy", "priests"] as const,
  lists: () => [...priestQueryKeys.all, "list"] as const,
  detail: (id: string) => [...priestQueryKeys.all, "detail", id] as const,
}

// 공개 신부님 소개 화면에서 사용하는 query key 집합이다.
// 관리자 화면 캐시와 분리해 공개 화면 invalidate 범위를 명확히 유지한다.
export const publicPriestQueryKeys = {
  all: ["public", "clergy", "priests"] as const,
  lists: () => [...publicPriestQueryKeys.all, "list"] as const,
}

type PriestListResponseDto = { ok?: boolean; items?: PriestListItemDto[] }
type PriestDetailResponseDto = { ok?: boolean; item?: PriestDetailDto }
type PublicPriestListResponseDto = PriestApiResponseDto<{
  items: PriestListItemDto[]
}>

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

// 공개 신부님 소개 목록 API를 호출한다.
// 공개 화면은 인증 없이 접근하므로 관리자 API와 별도 엔드포인트를 사용한다.
async function fetchPublicPriests() {
  const response = await apiFetch.get("/api/clergy/priests").send()
  if (!response.ok) throw new Error("신부님 소개를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicPriestListResponseDto | null

  return json?.ok && Array.isArray(json.items) ? json.items : []
}

// 공개 신부님 소개 목록 쿼리 훅이다.
// 공개 소개 페이지는 짧은 staleTime 동안 캐시를 재사용해 화면 전환 비용을 줄인다.
export function usePublicPriestListQuery() {
  return useQuery({
    queryKey: publicPriestQueryKeys.lists(),
    queryFn: fetchPublicPriests,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
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
      return matched as PriestDetailDto
    },
    initialDataUpdatedAt: 0,
  })
}
