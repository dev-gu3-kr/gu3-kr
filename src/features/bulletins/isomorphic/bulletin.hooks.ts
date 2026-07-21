"use client"

import {
  type QueryClient,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  ApiResponseDto,
  BulletinDetailDto,
  BulletinListItemDto,
  BulletinNavigationDto,
  BulletinPageDto,
  BulletinPublicDetailDto,
  BulletinPublicPageDto,
  BulletinPublishFilterDto,
} from "./bulletin.types"

type BulletinInfinitePageDto = BulletinPageDto["pageInfo"] & {
  items: BulletinListItemDto[]
}

export const bulletinQueryKeys = {
  all: ["admin", "bulletins"] as const,
  lists: () => [...bulletinQueryKeys.all, "list"] as const,
  list: (filters: { query: string; status: BulletinPublishFilterDto }) =>
    [...bulletinQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...bulletinQueryKeys.all, "detail", id] as const,
} as const

export const publicBulletinQueryKeys = {
  all: ["public", "bulletins"] as const,
  lists: () => [...publicBulletinQueryKeys.all, "list"] as const,
  list: (params: { page: number; query: string }) =>
    [...publicBulletinQueryKeys.lists(), params] as const,
  detail: (id: string) =>
    [...publicBulletinQueryKeys.all, "detail", "v1", id] as const,
} as const

export async function syncBulletinMutationCache(
  queryClient: QueryClient,
  options: { id?: string; deleted?: boolean } = {},
) {
  const { id, deleted = false } = options

  if (id && deleted) {
    queryClient.removeQueries({ queryKey: bulletinQueryKeys.detail(id) })
    queryClient.removeQueries({ queryKey: publicBulletinQueryKeys.detail(id) })
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: bulletinQueryKeys.lists() }),
    queryClient.invalidateQueries({
      queryKey: publicBulletinQueryKeys.lists(),
    }),
    id && !deleted
      ? queryClient.invalidateQueries({
          queryKey: bulletinQueryKeys.detail(id),
        })
      : Promise.resolve(),
    id && !deleted
      ? queryClient.invalidateQueries({
          queryKey: publicBulletinQueryKeys.detail(id),
        })
      : Promise.resolve(),
  ])
}

async function fetchBulletinPage(params: {
  cursor?: string | null
  filters: { query: string; status: BulletinPublishFilterDto }
}): Promise<BulletinInfinitePageDto> {
  const response = await apiFetch
    .get("/api/admin/bulletins")
    .query({
      take: 20,
      cursor: params.cursor,
      query: params.filters.query || undefined,
      status: params.filters.status,
    })
    .send()

  if (!response.ok) throw new Error("주보 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<BulletinPageDto> | null
  if (!json?.ok || !Array.isArray(json.items)) {
    return { items: [], hasMore: false, nextCursor: null, take: 20 }
  }

  return {
    items: json.items,
    hasMore: Boolean(json.pageInfo?.hasMore),
    nextCursor: json.pageInfo?.nextCursor ?? null,
    take: json.pageInfo?.take ?? 20,
  }
}

export function useBulletinListInfinite(params: {
  filters: { query: string; status: BulletinPublishFilterDto }
}) {
  return useInfiniteQuery({
    queryKey: bulletinQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchBulletinPage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    placeholderData: (prev) => prev,
    refetchOnMount: "always",
  })
}

async function fetchBulletinDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/bulletins/${id}`).send()
  if (!response.ok) throw new Error("주보 상세를 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item?: BulletinDetailDto
  }> | null

  if (!json?.ok || !json.item)
    throw new Error("주보 상세를 불러오지 못했습니다.")
  return json.item
}

export function useBulletinDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: bulletinQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchBulletinDetail(id),
    initialData: () => {
      const listQueries = queryClient.getQueriesData<{
        pages: BulletinInfinitePageDto[]
      }>({
        queryKey: bulletinQueryKeys.all,
      })

      for (const [, data] of listQueries) {
        const pages = data?.pages ?? []
        for (const page of pages) {
          const matched = page.items.find((item) => item.id === id)
          if (matched) {
            return { ...matched, content: "" } as BulletinDetailDto
          }
        }
      }

      return undefined
    },
    initialDataUpdatedAt: 0,
  })
}

type PublicBulletinPageResponse = ApiResponseDto<BulletinPublicPageDto>
type PublicBulletinDetailResponse = ApiResponseDto<{
  item: BulletinPublicDetailDto
  navigation: BulletinNavigationDto
}>

async function fetchPublicBulletinPage(params: {
  page: number
  query: string
}) {
  const response = await apiFetch
    .get("/api/bulletins")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) throw new Error("본당주보 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicBulletinPageResponse | null
  if (!json?.ok) throw new Error("본당주보 목록을 불러오지 못했습니다.")

  return json
}

async function fetchPublicBulletinDetail(id: string) {
  const response = await apiFetch.get(`/api/bulletins/${id}`).send()
  if (!response.ok) throw new Error("본당주보 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicBulletinDetailResponse | null
  if (!json?.ok || !json.item)
    throw new Error("본당주보 상세를 불러오지 못했습니다.")

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
  }
}

export function usePublicBulletinPageQuery(params: {
  page: number
  query: string
}) {
  return useQuery({
    queryKey: publicBulletinQueryKeys.list(params),
    queryFn: () => fetchPublicBulletinPage(params),
    staleTime: 10_000,
  })
}

export function usePublicBulletinDetailQuery(id: string) {
  return useQuery({
    queryKey: publicBulletinQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchPublicBulletinDetail(id),
    staleTime: 10_000,
  })
}
