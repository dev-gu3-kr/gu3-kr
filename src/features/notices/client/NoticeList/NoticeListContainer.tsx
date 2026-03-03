"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import type {
  ApiResponseDto,
  NoticePageDto,
} from "@/features/notices/isomorphic"
import { useNoticeListInfinite } from "@/features/notices/isomorphic"

type NoticePageResponse = ApiResponseDto<NoticePageDto>

type NoticeListContainerProps = {
  // SSR에서 미리 조회한 첫 페이지 데이터
  initialPage?: NoticePageResponse
}

export function NoticeListContainer({ initialPage }: NoticeListContainerProps) {
  // 목록 하단 관찰 대상 ref다.
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useNoticeListInfinite(initialPage)

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  )

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) {
      return
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0]

        if (!firstEntry?.isIntersecting || !hasNextPage || isFetchingNextPage) {
          return
        }

        await fetchNextPage()
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <p className="text-sm text-neutral-500">공지 목록을 불러오는 중...</p>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">공지 목록을 불러오지 못했습니다.</p>
    )
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <div className="rounded-md border p-4 text-sm text-neutral-500">
          등록된 공지가 없습니다.
        </div>
      ) : (
        items.map((notice) => (
          <Link
            key={notice.id}
            href={`/admin/notices/${notice.id}`}
            className="block rounded-md border p-4 transition-colors hover:bg-neutral-50"
          >
            <p className="font-medium">{notice.title}</p>
            <p className="mt-1 text-sm text-neutral-600">
              {notice.summary?.trim() || "요약 없음"}
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {notice.isPublished ? "공개" : "비공개"} ·{" "}
              {formatDistanceToNow(new Date(notice.createdAt), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </Link>
        ))
      )}

      <div ref={loadMoreRef} className="h-8" />

      {isFetchingNextPage ? (
        <p className="text-center text-xs text-neutral-500">불러오는 중...</p>
      ) : null}

      {!hasNextPage && items.length > 0 ? (
        <p className="text-center text-xs text-neutral-400">
          마지막 공지입니다.
        </p>
      ) : null}
    </div>
  )
}
