"use client"

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { GalleryListItemDto } from "./gallery.types"

export type GalleryPublishFilterDto = "all" | "published" | "draft"

type GalleryInfinitePageDto = {
  items: GalleryListItemDto[]
  hasMore: boolean
  nextCursor: string | null
}

type GalleryDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  galleryImages: Array<{ id: string; originalName: string; url: string }>
}

export const galleryQueryKeys = {
  all: ["admin", "gallery"] as const,
  list: (filters: { query: string; status: GalleryPublishFilterDto }) =>
    [...galleryQueryKeys.all, "list", filters] as const,
  detail: (id: string) => [...galleryQueryKeys.all, "detail", id] as const,
} as const

type GalleryListResponseDto = {
  ok?: boolean
  items?: GalleryListItemDto[]
  pageInfo?: { hasMore?: boolean; nextCursor?: string | null }
}

async function fetchGalleryPage(params: {
  cursor?: string | null
  filters: { query: string; status: GalleryPublishFilterDto }
}): Promise<GalleryInfinitePageDto> {
  const response = await apiFetch
    .get("/api/admin/gallery")
    .query({
      take: 20,
      cursor: params.cursor,
      query: params.filters.query.trim() || undefined,
      status: params.filters.status,
    })
    .send()

  if (!response.ok) throw new Error("갤러리 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as GalleryListResponseDto | null

  if (!json?.ok || !Array.isArray(json.items)) {
    return { items: [], hasMore: false, nextCursor: null }
  }

  return {
    items: json.items,
    hasMore: Boolean(json.pageInfo?.hasMore),
    nextCursor: json.pageInfo?.nextCursor ?? null,
  }
}

async function fetchGalleryDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/gallery/${id}`).send()
  if (!response.ok) throw new Error("갤러리 상세를 불러오지 못했습니다.")

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: GalleryDetailDto
  } | null

  if (!json?.ok || !json.item)
    throw new Error("갤러리 상세를 불러오지 못했습니다.")

  return json.item
}

export function useGalleryListInfinite(params: {
  filters: { query: string; status: GalleryPublishFilterDto }
}) {
  return useInfiniteQuery({
    queryKey: galleryQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchGalleryPage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    placeholderData: (previousData) => previousData,
  })
}

export function useGalleryDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: galleryQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchGalleryDetail(id),
    initialData: () => {
      const listQueries = queryClient.getQueriesData<{
        pages: GalleryInfinitePageDto[]
      }>({
        queryKey: galleryQueryKeys.all,
      })

      for (const [, data] of listQueries) {
        const pages = data?.pages ?? []
        for (const page of pages) {
          const matched = page.items.find((item) => item.id === id)
          if (matched) {
            return {
              ...matched,
              content: "",
              createdAt: String(matched.createdAt),
              galleryImages: [],
            } as GalleryDetailDto
          }
        }
      }

      return undefined
    },
    initialDataUpdatedAt: 0,
  })
}
