"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type { GalleryListItemDto } from "./gallery.types"

export type GalleryPublishFilterDto = "all" | "published" | "draft"

type GalleryInfinitePageDto = {
  items: GalleryListItemDto[]
  hasMore: boolean
  nextCursor: string | null
}

export const galleryQueryKeys = {
  all: ["admin", "gallery"] as const,
  list: (filters: { query: string; status: GalleryPublishFilterDto }) =>
    [...galleryQueryKeys.all, "list", filters] as const,
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
