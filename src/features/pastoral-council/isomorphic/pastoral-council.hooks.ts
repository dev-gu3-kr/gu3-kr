import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ApiResponseDto } from "@/features/notices/isomorphic"
import { apiFetch } from "@/lib/api"
import type {
  PastoralCouncilDetailDto,
  PastoralCouncilListItemDto,
  PastoralCouncilPositionDto,
  PastoralCouncilPublicPageDto,
} from "./pastoral-council.types"

export const pastoralCouncilQueryKeys = {
  all: ["admin", "pastoral-council"] as const,
  lists: () => [...pastoralCouncilQueryKeys.all, "members", "list"] as const,
  detail: (id: string) =>
    [...pastoralCouncilQueryKeys.all, "members", "detail", id] as const,
  positions: () =>
    [...pastoralCouncilQueryKeys.all, "positions", "list"] as const,
}

export const publicPastoralCouncilQueryKeys = {
  all: ["public", "community", "pastoral-council"] as const,
  detail: () => [...publicPastoralCouncilQueryKeys.all, "tree"] as const,
}

type ListResponse = { ok?: boolean; items?: PastoralCouncilListItemDto[] }
type DetailResponse = { ok?: boolean; item?: PastoralCouncilDetailDto }
type PositionsResponse = {
  ok?: boolean
  positions?: PastoralCouncilPositionDto[]
}
type PublicResponse = ApiResponseDto<PastoralCouncilPublicPageDto>

async function fetchPastoralCouncil() {
  const response = await apiFetch
    .get("/api/admin/pastoral-council")
    .query({ take: 30 })
    .send()
  if (!response.ok) throw new Error("사목협의회 목록을 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ListResponse | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function usePastoralCouncilListQuery() {
  return useQuery({
    queryKey: pastoralCouncilQueryKeys.lists(),
    queryFn: fetchPastoralCouncil,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })
}

async function fetchPastoralCouncilPositions() {
  const response = await apiFetch
    .get("/api/admin/pastoral-council/positions")
    .send()
  if (!response.ok) throw new Error("직책 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PositionsResponse | null
  return json?.ok && Array.isArray(json.positions) ? json.positions : []
}

export function usePastoralCouncilPositionsQuery() {
  return useQuery({
    queryKey: pastoralCouncilQueryKeys.positions(),
    queryFn: fetchPastoralCouncilPositions,
    staleTime: 30_000,
  })
}

async function fetchPublicPastoralCouncil() {
  const response = await apiFetch.get("/api/pastoral-council").send()
  if (!response.ok) throw new Error("사목협의회 정보를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicResponse | null
  if (
    !json?.ok ||
    !Array.isArray(json.positions) ||
    !Array.isArray(json.members)
  ) {
    throw new Error("사목협의회 정보를 불러오지 못했습니다.")
  }
  return { positions: json.positions, members: json.members }
}

export function usePublicPastoralCouncilQuery() {
  return useQuery({
    queryKey: publicPastoralCouncilQueryKeys.detail(),
    queryFn: fetchPublicPastoralCouncil,
    placeholderData: (previous) => previous,
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
  if (!json?.ok || !json.item) {
    throw new Error("사목협의회 상세를 불러오지 못했습니다.")
  }
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
