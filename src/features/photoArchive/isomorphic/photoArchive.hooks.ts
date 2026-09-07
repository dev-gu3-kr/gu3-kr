"use client"

import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  AdminArchivePhotoDto,
  AdminArchivePhotoPageDto,
  ArchivePhotoAdminFilterDto,
  ArchivePhotoBulkActionDto,
  ArchivePhotoStatusDto,
  DeleteArchivePhotoResultDto,
  PhotoArchiveApiResponseDto,
  PublicArchivePhotoDto,
  PublicArchivePhotoPageDto,
} from "./photoArchive.types"

export const adminPhotoArchiveQueryKeys = {
  all: ["admin", "photo-archive"] as const,
  lists: () => [...adminPhotoArchiveQueryKeys.all, "list"] as const,
  list: (filters: {
    year: number | null
    status: ArchivePhotoAdminFilterDto
  }) => [...adminPhotoArchiveQueryKeys.lists(), filters] as const,
  detail: (id: string) =>
    [...adminPhotoArchiveQueryKeys.all, "detail", id] as const,
} as const

export const publicPhotoArchiveQueryKeys = {
  all: ["public", "photo-archive"] as const,
  lists: () => [...publicPhotoArchiveQueryKeys.all, "list"] as const,
  list: (year: number | null) =>
    [...publicPhotoArchiveQueryKeys.lists(), { year }] as const,
  detail: (id: string) =>
    [...publicPhotoArchiveQueryKeys.all, "detail", id] as const,
} as const

type AdminArchivePhotoInfinitePage = AdminArchivePhotoPageDto
type PublicArchivePhotoInfinitePage = PublicArchivePhotoPageDto

async function fetchAdminPhotoArchivePage(input: {
  cursor?: string | null
  year: number | null
  status: ArchivePhotoAdminFilterDto
  signal?: AbortSignal
}): Promise<AdminArchivePhotoInfinitePage> {
  const response = await apiFetch
    .get("/api/admin/photo-archive")
    .query({
      take: 40,
      cursor: input.cursor || undefined,
      year: input.year ?? undefined,
      status: input.status,
    })
    .init({ signal: input.signal, cache: "no-store" })
    .send()
  if (!response.ok) throw new Error("사진 아카이브 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(
      () => null,
    )) as PhotoArchiveApiResponseDto<AdminArchivePhotoPageDto> | null
  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error(
      json?.message ?? "사진 아카이브 목록을 불러오지 못했습니다.",
    )
  }
  return json
}

async function fetchPublicPhotoArchivePage(input: {
  cursor?: string | null
  year: number | null
  signal?: AbortSignal
}): Promise<PublicArchivePhotoInfinitePage> {
  const response = await apiFetch
    .get("/api/photo-archive")
    .query({
      take: 60,
      cursor: input.cursor || undefined,
      year: input.year ?? undefined,
    })
    .init({ signal: input.signal })
    .send()
  if (!response.ok) throw new Error("사진 아카이브를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(
      () => null,
    )) as PhotoArchiveApiResponseDto<PublicArchivePhotoPageDto> | null
  if (!json?.ok || !Array.isArray(json.items)) {
    throw new Error(json?.message ?? "사진 아카이브를 불러오지 못했습니다.")
  }
  return json
}

export function useAdminPhotoArchiveInfinite(input: {
  year: number | null
  status: ArchivePhotoAdminFilterDto
}) {
  return useInfiniteQuery({
    queryKey: adminPhotoArchiveQueryKeys.list(input),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchAdminPhotoArchivePage({ ...input, cursor: pageParam, signal }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
    placeholderData: (previousData) => previousData,
  })
}

export function usePublicPhotoArchiveInfinite(year: number | null) {
  return useInfiniteQuery({
    queryKey: publicPhotoArchiveQueryKeys.list(year),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, signal }) =>
      fetchPublicPhotoArchivePage({ year, cursor: pageParam, signal }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore
        ? (lastPage.pageInfo.nextCursor ?? undefined)
        : undefined,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  })
}

export function usePublicArchivePhotoDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: publicPhotoArchiveQueryKeys.detail(id),
    enabled: enabled && id.length > 0,
    queryFn: async ({ signal }) => {
      const response = await apiFetch
        .get(`/api/photo-archive/${id}`)
        .init({ signal })
        .send()
      const json = (await response
        .json()
        .catch(() => null)) as PhotoArchiveApiResponseDto<{
        item?: PublicArchivePhotoDto
      }> | null
      if (!response.ok || !json?.ok || !json.item) {
        throw new Error(json?.message ?? "사진을 불러오지 못했습니다.")
      }
      return json.item
    },
    staleTime: 30_000,
  })
}

export async function invalidatePhotoArchiveQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: adminPhotoArchiveQueryKeys.lists(),
    }),
    queryClient.invalidateQueries({
      queryKey: publicPhotoArchiveQueryKeys.lists(),
    }),
  ])
}

export function useUploadArchivePhotoMutation() {
  return useMutation({
    mutationFn: async (input: { file: File; year: number }) => {
      const formData = new FormData()
      formData.append("file", input.file)
      formData.append("year", String(input.year))
      const response = await apiFetch
        .post("/api/admin/photo-archive")
        .init({ body: formData })
        .send()
      const json = (await response
        .json()
        .catch(() => null)) as PhotoArchiveApiResponseDto<{
        item?: AdminArchivePhotoDto
      }> | null
      if (!response.ok || !json?.ok || !json.item) {
        throw new Error(json?.message ?? "사진 업로드에 실패했습니다.")
      }
      return json.item
    },
  })
}

export function useUpdateArchivePhotoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      year?: number
      status?: ArchivePhotoStatusDto
      caption?: string | null
      altText?: string | null
    }) => {
      const response = await apiFetch
        .patch(`/api/admin/photo-archive/${input.id}`)
        .json({
          year: input.year,
          status: input.status,
          caption: input.caption,
          altText: input.altText,
        })
        .send()
      const json = (await response
        .json()
        .catch(() => null)) as PhotoArchiveApiResponseDto<{
        item?: AdminArchivePhotoDto
      }> | null
      if (!response.ok || !json?.ok || !json.item) {
        throw new Error(json?.message ?? "사진 정보를 변경하지 못했습니다.")
      }
      return json.item
    },
    onSuccess: async (item) => {
      queryClient.setQueryData(adminPhotoArchiveQueryKeys.detail(item.id), item)
      await invalidatePhotoArchiveQueries(queryClient)
    },
  })
}

export function useDeleteArchivePhotoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch
        .del(`/api/admin/photo-archive/${id}`)
        .send()
      const json = (await response
        .json()
        .catch(
          () => null,
        )) as PhotoArchiveApiResponseDto<DeleteArchivePhotoResultDto> | null
      if (!response.ok || !json?.ok || !json.id) {
        throw new Error(json?.message ?? "사진을 삭제하지 못했습니다.")
      }
      return { id: json.id, cleanupPending: Boolean(json.cleanupPending) }
    },
    onSuccess: async ({ id }) => {
      queryClient.removeQueries({
        queryKey: adminPhotoArchiveQueryKeys.detail(id),
        exact: true,
      })
      queryClient.removeQueries({
        queryKey: publicPhotoArchiveQueryKeys.detail(id),
        exact: true,
      })
      await invalidatePhotoArchiveQueries(queryClient)
    },
  })
}

export function useBulkArchivePhotoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      action: ArchivePhotoBulkActionDto
      photoIds: string[]
      year?: number
      status?: ArchivePhotoStatusDto
    }) => {
      const response = await apiFetch
        .post("/api/admin/photo-archive/bulk")
        .json(input)
        .send()
      const json = (await response
        .json()
        .catch(() => null)) as PhotoArchiveApiResponseDto<{
        count?: number
      }> | null
      if (!response.ok || !json?.ok) {
        throw new Error(json?.message ?? "일괄 작업을 처리하지 못했습니다.")
      }
      return json.count ?? 0
    },
    onSuccess: async () => invalidatePhotoArchiveQueries(queryClient),
  })
}

export function useAdminArchivePhotoDetail(id: string) {
  return useQuery({
    queryKey: adminPhotoArchiveQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: async ({ signal }) => {
      const response = await apiFetch
        .get(`/api/admin/photo-archive/${id}`)
        .init({ signal, cache: "no-store" })
        .send()
      const json = (await response
        .json()
        .catch(() => null)) as PhotoArchiveApiResponseDto<{
        item?: AdminArchivePhotoDto
      }> | null
      if (!response.ok || !json?.ok || !json.item) {
        throw new Error(json?.message ?? "사진 정보를 불러오지 못했습니다.")
      }
      return json.item
    },
  })
}
