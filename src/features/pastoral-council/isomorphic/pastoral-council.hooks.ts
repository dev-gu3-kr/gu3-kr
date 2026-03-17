import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import { apiFetch } from "@/lib/api"
import type {
  PastoralCouncilDetailDto,
  PastoralCouncilListItemDto,
  PastoralCouncilPublicPageDto,
} from "./pastoral-council.types"

export const pastoralCouncilQueryKeys = {
  all: ["admin", "pastoral-council"] as const,
  lists: () => [...pastoralCouncilQueryKeys.all, "list"] as const,
  detail: (id: string) =>
    [...pastoralCouncilQueryKeys.all, "detail", id] as const,
}

export const publicPastoralCouncilQueryKeys = {
  all: ["public", "community", "pastoral-council"] as const,
  lists: () => [...publicPastoralCouncilQueryKeys.all, "list"] as const,
}

type ListResponse = { ok?: boolean; items?: PastoralCouncilListItemDto[] }
type DetailResponse = { ok?: boolean; item?: PastoralCouncilDetailDto }
type PublicListResponse = ApiResponseDto<PastoralCouncilPublicPageDto>

async function fetchPastoralCouncil() {
  const response = await apiFetch
    .get("/api/admin/pastoral-council")
    .query({ take: 50 })
    .send()
  if (!response.ok) throw new Error("사목협의회 목록을 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ListResponse | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function usePastoralCouncilListQuery() {
  return useQuery({
    queryKey: pastoralCouncilQueryKeys.lists(),
    queryFn: fetchPastoralCouncil,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

async function fetchPublicPastoralCouncil() {
  const response = await apiFetch.get("/api/pastoral-council").send()
  if (!response.ok) throw new Error("사목협의회 정보를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicListResponse | null

  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function usePublicPastoralCouncilListQuery() {
  return useQuery({
    queryKey: publicPastoralCouncilQueryKeys.lists(),
    queryFn: fetchPublicPastoralCouncil,
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  })
}

async function fetchPastoralCouncilDetail(id: string) {
  const response = await apiFetch
    .get(`/api/admin/pastoral-council/${id}`)
    .send()
  if (!response.ok) throw new Error("사목협의회 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as DetailResponse | null
  if (!json?.ok || !json.item)
    throw new Error("사목협의회 상세를 불러오지 못했습니다.")
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
