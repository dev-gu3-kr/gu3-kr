"use client"

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"

export type BulletinPublishFilterDto = "all" | "published" | "draft"

export type BulletinListItemDto = {
  id: string
  title: string
  isPublished: boolean
  createdAt: string
  attachments: Array<{ url: string; originalName: string }>
}

export type BulletinDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  attachments: Array<{ id?: string; originalName: string; url: string }>
}

type BulletinListResponseDto = {
  ok?: boolean
  items?: BulletinListItemDto[]
  pageInfo?: { hasMore?: boolean; nextCursor?: string | null }
}

type BulletinInfinitePageDto = {
  items: BulletinListItemDto[]
  hasMore: boolean
  nextCursor: string | null
}

export const bulletinQueryKeys = {
  all: ["admin", "bulletins"] as const,
  list: (filters: { query: string; status: BulletinPublishFilterDto }) =>
    [...bulletinQueryKeys.all, "list", filters] as const,
  detail: (id: string) => [...bulletinQueryKeys.all, "detail", id] as const,
} as const

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
    .catch(() => null)) as BulletinListResponseDto | null
  if (!json?.ok || !Array.isArray(json.items)) {
    return { items: [], hasMore: false, nextCursor: null }
  }

  return {
    items: json.items,
    hasMore: Boolean(json.pageInfo?.hasMore),
    nextCursor: json.pageInfo?.nextCursor ?? null,
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

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: BulletinDetailDto
  } | null

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
