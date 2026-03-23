import type { QueryClient } from "@tanstack/react-query"
import type {
  ApiResponseDto,
  BulletinNavigationDto,
  BulletinPublicDetailDto,
  BulletinPublicPageDto,
} from "@/features/bulletins/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

async function fetchPublicBulletinPage(params: {
  page: number
  query: string
}) {
  const response = await serverApiFetch
    .get("/api/bulletins")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) {
    throw new Error("본당주보 목록을 불러오지 못했습니다.")
  }

  const json = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<BulletinPublicPageDto> | null

  if (!json?.ok) {
    throw new Error("본당주보 목록을 불러오지 못했습니다.")
  }

  return json
}

async function fetchPublicBulletinDetail(id: string) {
  const response = await serverApiFetch.get(`/api/bulletins/${id}`).send()

  if (!response.ok) {
    throw new Error("본당주보 상세를 불러오지 못했습니다.")
  }

  const json = (await response.json().catch(() => null)) as ApiResponseDto<{
    item: BulletinPublicDetailDto
    navigation: BulletinNavigationDto
  }> | null

  if (!json?.ok || !json.item) {
    throw new Error("본당주보 상세를 불러오지 못했습니다.")
  }

  return {
    item: json.item,
    navigation: json.navigation ?? { prev: null, next: null },
  }
}

export async function prefetchPublicBulletinList(
  queryClient: QueryClient,
  params: { page: number; query: string },
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "bulletins", "list", params] as const,
    queryFn: () => fetchPublicBulletinPage(params),
  })
}

export async function prefetchPublicBulletinDetail(
  queryClient: QueryClient,
  id: string,
) {
  await queryClient.prefetchQuery({
    queryKey: ["public", "bulletins", "detail", "v1", id] as const,
    queryFn: () => fetchPublicBulletinDetail(id),
  })
}
