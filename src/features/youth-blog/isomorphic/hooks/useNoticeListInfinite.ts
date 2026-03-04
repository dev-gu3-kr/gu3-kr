"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import type {
  ApiResponseDto,
  NoticeListItemDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "@/features/youth-blog/isomorphic"
import { apiFetch } from "@/lib/api"
import { youthBlogQueryKeys } from "../queryKeys"

type NoticePageResponse = ApiResponseDto<NoticePageDto>

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

// 검색어가 초성(ㄱ-ㅎ)만으로 구성됐는지 판별한다.
function isChoseongQuery(query: string) {
  return /^[ㄱ-ㅎ\s]+$/.test(query.trim())
}

// 한글 완성형 문자열을 초성 문자열로 변환해 초성 검색 비교에 사용한다.
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

// 서버에서 받은 아이템을 초성 기준으로 클라이언트에서 후처리 필터링한다.
function matchByChoseong(item: NoticeListItemDto, rawQuery: string) {
  const query = rawQuery.replace(/\s+/g, "")
  const haystack = `${item.title} ${item.content}`.replace(/\s+/g, "")

  return toChoseongText(haystack).includes(query)
}

// 공지 목록 1페이지를 조회한다.
// 일반 텍스트 검색은 서버 q 파라미터를 사용하고, 초성 검색은 클라이언트 후처리로 동작한다.
async function fetchNoticePage(params: {
  cursor?: string | null
  filters: NoticeListFilters
}): Promise<NoticePageResponse> {
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

  if (!response.ok) {
    throw new Error("공지 목록을 불러오지 못했습니다.")
  }

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

// 공지 목록 무한 스크롤 쿼리를 구성한다.
// 필터가 없는 첫 진입에서만 initialPage를 초기 데이터로 사용한다.
export function useNoticeListInfinite(params: {
  initialPage?: NoticePageResponse
  filters: NoticeListFilters
}) {
  const hasFilters =
    params.filters.query.trim() !== "" || params.filters.status !== "all"

  return useInfiniteQuery({
    queryKey: youthBlogQueryKeys.list(params.filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      fetchNoticePage({
        cursor: pageParam,
        filters: params.filters,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    placeholderData: (previousData) => previousData,
    ...(params.initialPage && !hasFilters
      ? {
          initialData: {
            pages: [params.initialPage],
            pageParams: [null],
          },
        }
      : {}),
  })
}
