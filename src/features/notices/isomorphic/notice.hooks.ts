"use client"

import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  ApiResponseDto,
  NoticeDetailDto,
  NoticeListItemDto,
  NoticePageDto,
  NoticePublicPageDto,
  NoticePublishFilterDto,
} from "./notice.types"

// 공지 목록 캐시 key를 한 곳에서 정의해 invalidate/prefetch 기준을 고정한다.
export const noticeQueryKeys = {
  all: ["admin", "notices"] as const,
  list: (filters: { query: string; status: NoticePublishFilterDto }) =>
    [...noticeQueryKeys.all, "list", filters] as const,
  detail: (id: string) => [...noticeQueryKeys.all, "detail", id] as const,
} as const

type NoticePageResponse = ApiResponseDto<NoticePageDto>
type NoticeDetailResponse = ApiResponseDto<{
  item: NoticeListItemDto & { createdAt: string }
}>

type NoticeListFilters = {
  query: string
  status: NoticePublishFilterDto
}

const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const

// 검색어가 초성만으로 구성됐는지 판단한다.
// 초성 검색은 서버가 아닌 클라이언트 후처리 분기로 보낸다.
function isChoseongQuery(query: string) {
  return /^[ㄱ-ㅎ\s]+$/.test(query.trim())
}

// 한글 음절을 초성 문자열로 변환한다.
// 초성 포함 검색 시 제목/본문을 같은 기준으로 비교하기 위한 전처리다.
function toChoseongText(input: string) {
  let result = ""
  for (const character of input) {
    const code = character.charCodeAt(0)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const choseongIndex = Math.floor((code - 0xac00) / 588)
      result += CHOSEONG[choseongIndex] ?? character
      continue
    }
    result += character
  }
  return result
}

// 공지 한 건이 초성 검색어에 매치되는지 판별한다.
// 공백을 제거한 제목+본문 기준으로 부분 일치를 허용한다.
function matchByChoseong(item: NoticeListItemDto, rawQuery: string) {
  const query = rawQuery.replace(/\s+/g, "")
  const haystack = `${item.title} ${item.content}`.replace(/\s+/g, "")
  return toChoseongText(haystack).includes(query)
}

// 공지 목록 페이지를 요청한다.
// 서버 쿼리는 일반 텍스트 검색에만 사용하고, 초성 검색은 응답 후 클라이언트에서 필터링한다.
// HTTP 실패는 throw 처리해 상위 훅/컨테이너의 에러 경로로 위임한다.
async function fetchNoticePage(params: {
  cursor?: string | null
  filters: NoticeListFilters
}): Promise<NoticePageResponse> {
  const normalizedQuery = params.filters.query.trim()
  const useServerQuery =
    normalizedQuery !== "" && !isChoseongQuery(normalizedQuery)

  const response = await apiFetch
    .get("/api/admin/notices")
    .query({
      take: 10,
      cursor: params.cursor,
      status: params.filters.status,
      q: useServerQuery ? normalizedQuery : undefined,
    })
    .send()

  if (!response.ok) throw new Error("공지 목록을 불러오지 못했습니다.")

  const json = (await response.json()) as Partial<NoticePageResponse>
  const items = Array.isArray(json.items)
    ? (json.items as NoticeListItemDto[])
    : []

  const filteredItems =
    normalizedQuery !== "" && isChoseongQuery(normalizedQuery)
      ? items.filter((item) => matchByChoseong(item, normalizedQuery))
      : items

  return {
    ok: Boolean(json.ok),
    items: filteredItems,
    nextCursor: json.nextCursor ?? null,
  }
}

// 공지 목록 무한 스크롤 쿼리 훅이다.
// 최초 진입 SSR 초기 페이지를 조건부 주입하고, 이후 재조회는 기존 데이터를 유지해 깜빡임을 줄인다.
export function useNoticeListInfinite(params: {
  initialPage?: NoticePageResponse
  filters: NoticeListFilters
}) {
  const hasFilters =
    params.filters.query.trim() !== "" || params.filters.status !== "all"

  return useInfiniteQuery({
    queryKey: noticeQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchNoticePage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (previousData) => previousData,
    ...(params.initialPage && !hasFilters
      ? { initialData: { pages: [params.initialPage], pageParams: [null] } }
      : {}),
  })
}

async function fetchNoticeDetail(id: string) {
  const response = await apiFetch.get(`/api/admin/notices/${id}`).send()
  if (!response.ok) throw new Error("공지 상세를 불러오지 못했습니다.")
  const json = (await response
    .json()
    .catch(() => null)) as NoticeDetailResponse | null
  if (!json?.ok || !json.item)
    throw new Error("공지 상세를 불러오지 못했습니다.")
  return json.item
}

export function useNoticeDetailQuery(id: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: noticeQueryKeys.detail(id),
    enabled: id.length > 0,
    queryFn: () => fetchNoticeDetail(id),
    initialData: () => {
      const listQueries = queryClient.getQueriesData<{
        pages: NoticePageResponse[]
      }>({
        queryKey: noticeQueryKeys.all,
      })

      for (const [, data] of listQueries) {
        const pages = data?.pages ?? []
        for (const page of pages) {
          const matched = page.items.find((item) => item.id === id)
          if (matched)
            return {
              ...matched,
              createdAt: new Date(matched.createdAt).toISOString(),
            }
        }
      }
      return undefined
    },
    initialDataUpdatedAt: 0,
  })
}

type PublicNoticePageResponse = ApiResponseDto<NoticePublicPageDto>
type PublicNoticeDetailResponse = ApiResponseDto<{ item: NoticeDetailDto }>

async function fetchPublicNoticePage(params: { page: number; query: string }) {
  const response = await apiFetch
    .get("/api/notices")
    .query({ page: params.page, q: params.query || undefined })
    .send()

  if (!response.ok) throw new Error("공지사항 목록을 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicNoticePageResponse | null
  if (!json?.ok) throw new Error("공지사항 목록을 불러오지 못했습니다.")

  return json
}

async function fetchPublicNoticeDetail(id: string) {
  const response = await apiFetch.get("/api/notices/" + id).send()
  if (!response.ok) throw new Error("공지사항 상세를 불러오지 못했습니다.")

  const json = (await response
    .json()
    .catch(() => null)) as PublicNoticeDetailResponse | null
  if (!json?.ok || !json.item)
    throw new Error("공지사항 상세를 불러오지 못했습니다.")

  return json.item
}

export function usePublicNoticePageQuery(params: {
  page: number
  query: string
}) {
  return useQuery({
    queryKey: ["public", "notices", "list", params] as const,
    queryFn: () => fetchPublicNoticePage(params),
    staleTime: 10_000,
  })
}

export function usePublicNoticeDetailQuery(id: string) {
  return useQuery({
    queryKey: ["public", "notices", "detail", id] as const,
    enabled: id.length > 0,
    queryFn: () => fetchPublicNoticeDetail(id),
    staleTime: 10_000,
  })
}
