"use client"

import {
  type QueryClient,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { homeQueryKeys } from "@/features/home/isomorphic"
import { apiFetch } from "@/lib/api"
import type {
  EventDetailDto,
  EventListItemDto,
  EventPublishFilterDto,
} from "./event.types"

type EventListResponseDto = {
  ok?: boolean
  items?: EventListItemDto[]
  pageInfo?: { hasMore?: boolean; nextCursor?: string | null }
}

type EventInfinitePageDto = {
  items: EventListItemDto[]
  hasMore: boolean
  nextCursor: string | null
}

export const eventQueryKeys = {
  all: ["admin", "events"] as const,
  lists: () => [...eventQueryKeys.all, "list"] as const,
  list: (filters: { query: string; status: EventPublishFilterDto }) =>
    [...eventQueryKeys.lists(), filters] as const,
  schedulers: () => [...eventQueryKeys.all, "scheduler"] as const,
  scheduler: (params: {
    from: string
    to: string
    query: string
    status: EventPublishFilterDto
  }) => [...eventQueryKeys.schedulers(), params] as const,
  detail: (id: string) => [...eventQueryKeys.all, "detail", id] as const,
} as const

export async function syncEventMutationCache(
  queryClient: QueryClient,
  options: { id?: string; deleted?: boolean } = {},
) {
  const { id, deleted = false } = options

  if (id && deleted) {
    queryClient.removeQueries({ queryKey: eventQueryKeys.detail(id) })
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: eventQueryKeys.schedulers() }),
    queryClient.invalidateQueries({ queryKey: homeQueryKeys.all }),
    id && !deleted
      ? queryClient.invalidateQueries({ queryKey: eventQueryKeys.detail(id) })
      : Promise.resolve(),
  ])
}

async function fetchEventPage(params: {
  cursor?: string | null
  filters: { query: string; status: EventPublishFilterDto }
}): Promise<EventInfinitePageDto> {
  const response = await apiFetch
    .get("/api/admin/events")
    .query({
      take: 20,
      cursor: params.cursor,
      query: params.filters.query || undefined,
      status: params.filters.status,
    })
    .send()

  if (!response.ok) throw new Error("일정 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as EventListResponseDto | null
  if (!json?.ok || !Array.isArray(json.items)) {
    return { items: [], hasMore: false, nextCursor: null }
  }

  return {
    items: json.items,
    hasMore: Boolean(json.pageInfo?.hasMore),
    nextCursor: json.pageInfo?.nextCursor ?? null,
  }
}

export function useEventListInfinite(params: {
  filters: { query: string; status: EventPublishFilterDto }
}) {
  return useInfiniteQuery({
    queryKey: eventQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchEventPage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    placeholderData: (prev) => prev,
  })
}

async function fetchScheduler(params: {
  from: string
  to: string
  query: string
  status: EventPublishFilterDto
}) {
  const response = await apiFetch
    .get("/api/admin/events")
    .query({
      take: 500,
      from: params.from,
      to: params.to,
      query: params.query || undefined,
      status: params.status,
    })
    .send()

  if (!response.ok) throw new Error("일정 목록을 불러오지 못했습니다.")
  const json = (await response
    .json()
    .catch(() => null)) as EventListResponseDto | null
  return json?.ok && Array.isArray(json.items) ? json.items : []
}

export function useEventSchedulerQuery(params: {
  from?: string
  to?: string
  query: string
  status: EventPublishFilterDto
}) {
  const enabled = Boolean(params.from && params.to)
  return useQuery({
    queryKey: eventQueryKeys.scheduler({
      from: params.from ?? "",
      to: params.to ?? "",
      query: params.query,
      status: params.status,
    }),
    enabled,
    queryFn: () =>
      fetchScheduler({
        from: params.from ?? "",
        to: params.to ?? "",
        query: params.query,
        status: params.status,
      }),
    placeholderData: (prev) => prev,
  })
}

async function fetchEventDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/events/${id}`).send()
  if (!response.ok) throw new Error("일정 상세를 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: EventDetailDto
  } | null

  if (!json?.ok || !json.item)
    throw new Error("일정 상세를 불러오지 못했습니다.")
  return json.item
}

export function useEventDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchEventDetail(id),
    initialData: () => {
      const listQueries = queryClient.getQueriesData<{
        pages: EventInfinitePageDto[]
      }>({
        queryKey: eventQueryKeys.all,
      })

      for (const [, data] of listQueries) {
        const pages = data?.pages ?? []
        for (const page of pages) {
          const matched = page.items.find((item) => item.id === id)
          if (matched) return matched as EventDetailDto
        }
      }

      return undefined
    },
    initialDataUpdatedAt: 0,
  })
}
