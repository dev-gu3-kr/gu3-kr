import type { QueryClient } from "@tanstack/react-query"

import type {
  ApiResponseDto,
  NoticeDetailDto,
  NoticeNavigationDto,
  NoticePublicPageDto,
} from "@/features/notices/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicNoticePage(params: { page: number; query: string }) {
  const response = await serverApiFetch
    .get("/api/notices")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) {
    throw new Error("공지사항 목록을 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<NoticePublicPageDto> | null

  if (!json?.ok) {
    throw new Error("공지사항 목록을 불러오지 못했습니다.")
  }

  return json
}

async function fetchPublicNoticeDetail(id: string) {
  const response = await serverApiFetch.get(`/api/notices/${id}`).send()

  if (!response.ok) {
    throw new Error("공지사항 상세를 불러오지 못했습니다.")
  }

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: NoticeDetailDto
    navigation: NoticeNavigationDto
  }> | null

  if (!json?.ok || !json.item) {
    throw new Error("공지사항 상세를 불러오지 못했습니다.")
  }

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
  }
}

export async function prefetchPublicNoticeList(
  queryClient: QueryClient,
  params: { page: number; query: string },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "notices", "list", params] as const,
    queryFn: () => fetchPublicNoticePage(params),
  })
}

export async function prefetchPublicNoticeDetail(
  queryClient: QueryClient,
  id: string,
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "notices", "detail", "v2", id] as const,
    queryFn: () => fetchPublicNoticeDetail(id),
  })
}
