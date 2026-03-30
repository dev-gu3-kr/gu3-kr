import type { QueryClient } from "@tanstack/react-query"
import type {
  ApiResponseDto,
  YouthBlogDetailDto,
  YouthBlogNavigationDto,
  YouthBlogPublicPageDto,
} from "@/features/youth-blog/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicYouthBlogPage(params: {
  page: number
  query: string
}) {
  const response = await serverApiFetch
    .get("/api/youth-blog")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) {
    throw new Error("청소년 블로그 목록을 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<YouthBlogPublicPageDto> | null

  if (!json?.ok) {
    throw new Error("청소년 블로그 목록을 불러오지 못했습니다.")
  }

  return json
}

async function fetchPublicYouthBlogDetail(id: string) {
  const response = await serverApiFetch.get(`/api/youth-blog/${id}`).send()

  if (!response.ok) {
    throw new Error("청소년 블로그 상세를 불러오지 못했습니다.")
  }

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: YouthBlogDetailDto
    navigation: YouthBlogNavigationDto
  }> | null

  if (!json?.ok || !json.item) {
    throw new Error("청소년 블로그 상세를 불러오지 못했습니다.")
  }

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
  }
}

export async function prefetchPublicYouthBlogList(
  queryClient: QueryClient,
  params: { page: number; query: string },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "youth-blog", "list", params] as const,
    queryFn: () => fetchPublicYouthBlogPage(params),
  })
}

export async function prefetchPublicYouthBlogDetail(
  queryClient: QueryClient,
  id: string,
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "youth-blog", "detail", "v1", id] as const,
    queryFn: () => fetchPublicYouthBlogDetail(id),
  })
}
