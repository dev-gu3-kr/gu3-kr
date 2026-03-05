"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api"
import type {
  ApiResponseDto,
  NoticeListItemDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "./notice.types"

export const noticeQueryKeys = {
  all: ["admin", "notices"] as const,
  list: (filters: { query: string; status: NoticePublishFilterDto }) =>
    [...noticeQueryKeys.all, "list", filters] as const,
} as const

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

function isChoseongQuery(query: string) {
  return /^[ㄱ-ㅎ\s]+$/.test(query.trim())
}

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

function matchByChoseong(item: NoticeListItemDto, rawQuery: string) {
  const query = rawQuery.replace(/\s+/g, "")
  const haystack = `${item.title} ${item.content}`.replace(/\s+/g, "")
  return toChoseongText(haystack).includes(query)
}

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
