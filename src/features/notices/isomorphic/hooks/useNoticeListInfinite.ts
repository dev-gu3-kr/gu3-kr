"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import type {
  ApiResponseDto,
  NoticeListItemDto,
  NoticePageDto,
} from "@/features/notices/isomorphic"
import { apiFetch } from "@/lib/api"
import { noticeQueryKeys } from "../queryKeys"

type NoticePageResponse = ApiResponseDto<NoticePageDto>

async function fetchNoticePage(
  cursor?: string | null,
): Promise<NoticePageResponse> {
  const response = await apiFetch
    .get("/api/admin/notices")
    .query({ take: 10, cursor })
    .send()

  if (!response.ok) {
    throw new Error("공지 목록을 불러오지 못했습니다.")
  }

  const json = (await response.json()) as Partial<NoticePageResponse>

  return {
    ok: Boolean(json.ok),
    items: Array.isArray(json.items) ? (json.items as NoticeListItemDto[]) : [],
    nextCursor: json.nextCursor ?? null,
  }
}

export function useNoticeListInfinite(initialPage?: NoticePageResponse) {
  return useInfiniteQuery({
    queryKey: noticeQueryKeys.list(),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => fetchNoticePage(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...(initialPage
      ? {
          initialData: {
            pages: [initialPage],
            pageParams: [null],
          },
        }
      : {}),
  })
}
