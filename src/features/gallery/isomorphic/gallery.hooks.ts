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
  GalleryDetailDto,
  GalleryListItemDto,
  GalleryNavigationDto,
  GalleryPublicPageDto,
} from "./gallery.types"

export type GalleryPublishFilterDto = "all" | "published" | "draft"

type GalleryInfinitePageDto = {
  items: GalleryListItemDto[]
  hasMore: boolean
  nextCursor: string | null
}

export const galleryQueryKeys = {
  all: ["admin", "gallery"] as const,
  lists: () => [...galleryQueryKeys.all, "list"] as const,
  list: (filters: { query: string; status: GalleryPublishFilterDto }) =>
    [...galleryQueryKeys.lists(), filters] as const,
  detail: (id: string) => [...galleryQueryKeys.all, "detail", id] as const,
} as const

export const publicGalleryQueryKeys = {
  all: ["public", "gallery"] as const,
  lists: () => [...publicGalleryQueryKeys.all, "list"] as const,
  list: (params: { page: number; query: string }) =>
    [...publicGalleryQueryKeys.lists(), params] as const,
  detail: (id: string) =>
    [...publicGalleryQueryKeys.all, "detail", "v1", id] as const,
} as const

export async function syncGalleryMutationCache(
  queryClient: QueryClient,
  options: { id?: string; deleted?: boolean } = {},
) {
  const { id, deleted = false } = options

  if (id && deleted) {
    queryClient.removeQueries({ queryKey: galleryQueryKeys.detail(id) })
    queryClient.removeQueries({ queryKey: publicGalleryQueryKeys.detail(id) })
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: galleryQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: publicGalleryQueryKeys.lists() }),
    id && !deleted
      ? queryClient.invalidateQueries({ queryKey: galleryQueryKeys.detail(id) })
      : Promise.resolve(),
    id && !deleted
      ? queryClient.invalidateQueries({
          queryKey: publicGalleryQueryKeys.detail(id),
        })
      : Promise.resolve(),
  ])
}

type GalleryListResponseDto = {
  ok?: boolean
  items?: GalleryListItemDto[]
  pageInfo?: { hasMore?: boolean; nextCursor?: string | null }
}

type GalleryDetailResponseDto = ApiResponseDto<{
  item: GalleryDetailDto
}>

type PublicGalleryDetailResponseDto = ApiResponseDto<{
  item: GalleryDetailDto
  navigation: GalleryNavigationDto
}>

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

  if (!response.ok) throw new Error("갤러리 목록을 불러오지 못했습니다.")

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
  const response = await apiFetch
    .get(`/api/admin/gallery/${id}`)
    .init({ cache: "no-store" })
    .send()
  if (!response.ok) throw new Error("갤러리 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as GalleryDetailResponseDto | null

  if (!json?.ok || !json.item)
    throw new Error("갤러리 상세를 불러오지 못했습니다.")

  return json.item
}

async function fetchPublicGalleryPage(params: { page: number; query: string }) {
  const response = await apiFetch
    .get("/api/gallery")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) throw new Error("갤러리 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<GalleryPublicPageDto> | null

  if (!json?.ok) throw new Error("갤러리 목록을 불러오지 못했습니다.")

  return json
}

async function fetchPublicGalleryDetail(id: string) {
  const response = await apiFetch.get(`/api/gallery/${id}`).send()

  if (!response.ok) throw new Error("갤러리 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicGalleryDetailResponseDto | null

  if (!json?.ok || !json.item)
    throw new Error("갤러리 상세를 불러오지 못했습니다.")

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
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
              id: matched.id,
              title: matched.title,
              content: "",
              isPublished: matched.isPublished,
              createdAt: new Date(matched.createdAt).toISOString(),
              galleryImages: matched.thumbnailUrl
                ? [
                    {
                      id: `prefetched-${matched.id}`,
                      originalName: matched.title,
                      url: matched.thumbnailUrl,
                    },
                  ]
                : [],
              youtubeUrl: null,
              hasYoutube: matched.hasYoutube,
            } satisfies GalleryDetailDto
          }
        }
      }

      return undefined
    },
    initialDataUpdatedAt: 0,
    refetchOnMount: "always",
  })
}

export function usePublicGalleryPageQuery(params: {
  page: number
  query: string
}) {
  return useQuery({
    queryKey: publicGalleryQueryKeys.list(params),
    queryFn: () => fetchPublicGalleryPage(params),
    staleTime: 10_000,
  })
}

export function usePublicGalleryDetailQuery(id: string) {
  return useQuery({
    queryKey: publicGalleryQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchPublicGalleryDetail(id),
    staleTime: 10_000,
  })
}
