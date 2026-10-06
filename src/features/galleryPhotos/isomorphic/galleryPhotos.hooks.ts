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
  AdminGalleryPhotoDto,
  GalleryPhotoDetailDto,
  GalleryPhotoDto,
  GalleryPhotoPageDto,
  GalleryUploadItemDto,
} from "./galleryPhotos.types"

const keys = (postId: string, admin: boolean) =>
  [admin ? "admin" : "public", "gallery-photos", postId] as const
async function read<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => null)) as
    | (T & { ok?: boolean; message?: string })
    | null
  if (!response.ok || !json?.ok)
    throw new Error(json?.message ?? "행사 사진 요청을 처리하지 못했습니다.")
  return json
}

export function useGalleryPhotos(
  postId: string,
  admin = false,
  status = "ALL",
) {
  return useInfiniteQuery({
    queryKey: [...keys(postId, admin), "list", status],
    enabled: Boolean(postId),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) =>
      read<GalleryPhotoPageDto<AdminGalleryPhotoDto | GalleryPhotoDto>>(
        await apiFetch
          .get(`${admin ? "/api/admin" : "/api"}/gallery/${postId}/photos`)
          .query({ cursor: pageParam || undefined, status })
          .init({ signal, cache: "no-store" })
          .send(),
      ),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    staleTime: admin ? 0 : 30_000,
  })
}

export function useGalleryPhotoDetail(postId: string, photoId: string) {
  return useQuery({
    queryKey: [...keys(postId, false), "detail", photoId],
    enabled: Boolean(postId && photoId),
    queryFn: async ({ signal }) =>
      read<GalleryPhotoDetailDto>(
        await apiFetch
          .get(`/api/gallery/${postId}/photos/${photoId}`)
          .init({ signal })
          .send(),
      ),
    staleTime: 30_000,
  })
}

export function useGalleryUploads(postId: string) {
  return useQuery({
    queryKey: [...keys(postId, true), "uploads"],
    enabled: Boolean(postId),
    queryFn: async ({ signal }) =>
      read<{ items: GalleryUploadItemDto[] }>(
        await apiFetch
          .get(`/api/admin/gallery/${postId}/uploads`)
          .init({ signal, cache: "no-store" })
          .send(),
      ),
    refetchInterval: (query) =>
      query.state.data?.items.some((item) =>
        ["QUEUED", "PROCESSING", "UPLOADING"].includes(item.status),
      )
        ? 2000
        : false,
  })
}

export async function invalidateGalleryPhotos(
  client: QueryClient,
  postId: string,
) {
  await Promise.all(
    [true, false].map((admin) =>
      client.invalidateQueries({ queryKey: keys(postId, admin) }),
    ),
  )
}

export function useCreateGalleryUploadBatch(postId: string) {
  return useMutation({
    mutationFn: async (input: {
      id: string
      files: Array<{ id: string; name: string; size: number }>
    }) =>
      read<{ batchId: string }>(
        await apiFetch
          .post(`/api/admin/gallery/${postId}/uploads`)
          .json(input)
          .send(),
      ),
  })
}

export function useUploadGalleryPhoto(postId: string) {
  return useMutation({
    mutationFn: async (input: { id: string; file: File }) => {
      const body = new FormData()
      body.append("file", input.file)
      return read<{ status: GalleryUploadItemDto["status"] }>(
        await apiFetch
          .post(`/api/admin/gallery/${postId}/uploads/${input.id}`)
          .init({ body })
          .send(),
      )
    },
  })
}

export function useRetryGalleryPhoto(postId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      read(
        await apiFetch
          .patch(`/api/admin/gallery/${postId}/uploads/${id}`)
          .json({})
          .send(),
      ),
    onSuccess: () => invalidateGalleryPhotos(client, postId),
  })
}

export function useBulkGalleryPhotoStatus(postId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      photoIds: string[]
      status: "PUBLISHED" | "HIDDEN"
    }) =>
      read<{ count: number }>(
        await apiFetch
          .post(`/api/admin/gallery/${postId}/photos/bulk`)
          .json(input)
          .send(),
      ),
    onSuccess: () => invalidateGalleryPhotos(client, postId),
  })
}

export function useUpdateGalleryPhoto(postId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      status: "PUBLISHED" | "HIDDEN"
      caption: string
      altText: string
    }) =>
      read(
        await apiFetch
          .patch(`/api/admin/gallery/${postId}/photos/${input.id}`)
          .json({
            status: input.status,
            caption: input.caption || null,
            altText: input.altText || null,
          })
          .send(),
      ),
    onSuccess: () => invalidateGalleryPhotos(client, postId),
  })
}

export function useDeleteGalleryPhoto(postId: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
      read<{ cleanupPending: boolean }>(
        await apiFetch.del(`/api/admin/gallery/${postId}/photos/${id}`).send(),
      ),
    onSuccess: () => invalidateGalleryPhotos(client, postId),
  })
}
