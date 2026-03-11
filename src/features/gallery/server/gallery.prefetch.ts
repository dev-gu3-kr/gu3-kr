import type { QueryClient } from "@tanstack/react-query"

import type {
  ApiResponseDto,
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

export async function prefetchPublicGalleryList(
  queryClient: QueryClient,
  params: { page: number; query: string },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "gallery", "list", params] as const,
    queryFn: () => fetchPublicGalleryPage(params),
  })
}
