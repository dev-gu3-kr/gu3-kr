import type { QueryClient } from "@tanstack/react-query"

import type {
  ApiResponseDto,
  GalleryDetailDto,
  GalleryNavigationDto,
  GalleryPublicPageDto,
} from "@/features/gallery/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicGalleryPage(params: { page: number; query: string }) {
  const response = await serverApiFetch
    .get("/api/gallery")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) {
    throw new Error("갤러리 목록을 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<GalleryPublicPageDto> | null

  if (!json?.ok) {
    throw new Error("갤러리 목록을 불러오지 못했습니다.")
  }

  return json
}

async function fetchPublicGalleryDetail(id: string) {
  const response = await serverApiFetch.get(`/api/gallery/${id}`).send()

  if (!response.ok) {
    throw new Error("갤러리 상세를 불러오지 못했습니다.")
  }

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: GalleryDetailDto
    navigation: GalleryNavigationDto
  }> | null

  if (!json?.ok || !json.item) {
    throw new Error("갤러리 상세를 불러오지 못했습니다.")
  }

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
  }
}

export async function prefetchPublicGalleryList(
  queryClient: QueryClient,
  params: { page: number; query: string },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "gallery", "list", params] as const,
    queryFn: () => fetchPublicGalleryPage(params),
  })
}

export async function prefetchPublicGalleryDetail(
  queryClient: QueryClient,
  id: string,
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "gallery", "detail", "v1", id] as const,
    queryFn: () => fetchPublicGalleryDetail(id),
  })
}
