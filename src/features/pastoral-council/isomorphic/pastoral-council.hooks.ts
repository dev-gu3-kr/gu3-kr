import { useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  PastoralCouncilDetailDto,
  PastoralCouncilListItemDto,
} from "./pastoral-council.types"

// 사목협의회 목록 조회 key 집합이다.
// 같은 리스트에 대한 무효화/재조회 기준을 일관되게 유지한다.
export const pastoralCouncilQueryKeys = {
  all: ["admin", "pastoral-council"] as const,
  lists: () => [...pastoralCouncilQueryKeys.all, "list"] as const,
  detail: (id: string) =>
    [...pastoralCouncilQueryKeys.all, "detail", id] as const,
}

type ListResponse = { ok?: boolean; items?: PastoralCouncilListItemDto[] }
type DetailResponse = { ok?: boolean; item?: PastoralCouncilDetailDto }

// 사목협의회 목록 API를 호출한다.
// 비정상 응답은 throw 처리해 컨테이너 에러 경로로 위임한다.
async function fetchPastoralCouncil() {
  const response = await apiFetch
    .get("/api/admin/pastoral-council")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("사목협의회 목록을 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ListResponse | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

// 사목협의회 목록 쿼리 훅이다.
// placeholderData로 화면 유지 후 백그라운드 갱신을 수행한다.
export function usePastoralCouncilListQuery() {
  return useQuery({
    queryKey: pastoralCouncilQueryKeys.lists(),
    queryFn: fetchPastoralCouncil,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

async function fetchPastoralCouncilDetail(id: string) {
  const response = await apiFetch
    .get(`/api/admin/pastoral-council/${id}`)
    .send()
  if (!response.ok) throw new Error("사목협의회 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as DetailResponse | null
  if (!json?.ok || !json.item)
    throw new Error("사목협의회 상세를 불러오지 못했습니다.")
  return json.item
}

export function usePastoralCouncilDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: pastoralCouncilQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchPastoralCouncilDetail(id),
    initialData: () => {
      const cachedList = queryClient.getQueryData<PastoralCouncilListItemDto[]>(
        pastoralCouncilQueryKeys.lists(),
      )
      return cachedList?.find((item) => item.id === id) as
        | PastoralCouncilDetailDto
        | undefined
    },
    initialDataUpdatedAt: 0,
  })
}
