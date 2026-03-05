"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  ApiResponseDto,
  YouthBlogListItemDto,
  YouthBlogPageDto,
  YouthBlogPublishFilterDto,
} from "./youth-blog.types"

// 청소년 블로그 목록 캐시 key를 중앙 관리해 invalidate 범위를 명확히 유지한다.
export const youthBlogQueryKeys = {
  all: ["admin", "youth-blog"] as const,
  list: (filters: { query: string; status: YouthBlogPublishFilterDto }) =>
    [...youthBlogQueryKeys.all, "list", filters] as const,
} as const

type YouthBlogPageResponse = ApiResponseDto<YouthBlogPageDto>

type YouthBlogListFilters = {
  query: string
  status: YouthBlogPublishFilterDto
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

// 검색어가 초성 전용 패턴인지 판별한다.
// 초성 검색은 서버 q 파라미터 대신 클라이언트 필터링으로 처리한다.
function isChoseongQuery(query: string) {
  return /^[ㄱ-ㅎ\s]+$/.test(query.trim())
}

// 한글 문자열을 초성 문자열로 변환한다.
// 제목/본문과 입력 검색어를 동일한 비교 축으로 맞추기 위한 변환이다.
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

// 목록 아이템이 초성 검색어에 매치되는지 판별한다.
function matchByChoseong(item: YouthBlogListItemDto, rawQuery: string) {
  const query = rawQuery.replace(/\s+/g, "")
  const haystack = `${item.title} ${item.content}`.replace(/\s+/g, "")
  return toChoseongText(haystack).includes(query)
}

// 청소년 블로그 목록 페이지를 조회한다.
// 일반 검색어는 서버 검색을 사용하고, 초성 검색어는 수신 데이터에 후처리 필터를 적용한다.
// API 실패는 throw로 전달해 컨테이너 단 에러 UI와 연결한다.
async function fetchYouthBlogPage(params: {
  cursor?: string | null
  filters: YouthBlogListFilters
}): Promise<YouthBlogPageResponse> {
  const normalizedQuery = params.filters.query.trim()
  const useServerQuery =
    normalizedQuery !== "" && !isChoseongQuery(normalizedQuery)

  const response = await apiFetch
    .get("/api/admin/youth-blog")
    .query({
      take: 10,
      cursor: params.cursor,
      status: params.filters.status,
      q: useServerQuery ? normalizedQuery : undefined,
    })
    .send()

  if (!response.ok) throw new Error("청소년 블로그 목록을 불러오지 못했습니다.")

  const json = (await response.json()) as Partial<YouthBlogPageResponse>
  const items = Array.isArray(json.items)
    ? (json.items as YouthBlogListItemDto[])
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

// 청소년 블로그 목록 무한 스크롤 쿼리 훅이다.
// 필터가 없을 때만 초기 페이지를 주입해 최초 진입 비용을 줄이고, 이후에는 기존 데이터를 유지한다.
export function useYouthBlogListInfinite(params: {
  initialPage?: YouthBlogPageResponse
  filters: YouthBlogListFilters
}) {
  const hasFilters =
    params.filters.query.trim() !== "" || params.filters.status !== "all"

  return useInfiniteQuery({
    queryKey: youthBlogQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchYouthBlogPage({ cursor: pageParam, filters: params.filters }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (previousData) => previousData,
    ...(params.initialPage && !hasFilters
      ? { initialData: { pages: [params.initialPage], pageParams: [null] } }
      : {}),
  })
}
