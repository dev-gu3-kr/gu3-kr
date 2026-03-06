"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  ApiResponseDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "@/features/notices/isomorphic"
import { useNoticeListInfinite } from "@/features/notices/isomorphic"

type NoticePageResponse = ApiResponseDto<NoticePageDto>

type NoticeListContainerProps = {
  initialPage?: NoticePageResponse
}

export function NoticeListContainer({ initialPage }: NoticeListContainerProps) {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<NoticePublishFilterDto>("all")

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(queryInput)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [queryInput])

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
    isError,
  } = useNoticeListInfinite({
    initialPage,
    filters: { query, status },
  })

  const isFilterFetching = isFetching && !isFetchingNextPage

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  )

  const handleLoadMore = useCallback(async () => {
    await fetchNextPage()
  }, [fetchNextPage])

  return (
    <div className="space-y-3">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "published" ||
                value === "draft"
              ) {
                setStatus(value)
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="전체">
              전체
            </ToggleGroupItem>
            <ToggleGroupItem value="published" aria-label="공개">
              공개
            </ToggleGroupItem>
            <ToggleGroupItem value="draft" aria-label="비공개">
              비공개
            </ToggleGroupItem>
          </ToggleGroup>

          {isFilterFetching || isFetchingNextPage ? (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:hidden">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              불러오는 중
            </p>
          ) : null}
        </div>

        <div className="relative sm:max-w-sm sm:flex-1">
          <input
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="검색"
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>

        {isFilterFetching || isFetchingNextPage ? (
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            불러오는 중
          </p>
        ) : null}
      </section>

      {isLoading && items.length === 0 ? (
        <div className="space-y-2">
          {["sk-1", "sk-2", "sk-3", "sk-4"].map((key) => (
            <div key={key} className="animate-pulse rounded-md border p-4">
              <div className="h-5 w-3/5 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-4/5 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-32 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : null}

      {isError && items.length === 0 ? (
        <p className="text-sm text-red-600">공지 목록을 불러오지 못했습니다.</p>
      ) : null}

      <div
        className={
          isFilterFetching
            ? "pointer-events-none relative space-y-2 opacity-60"
            : "relative space-y-2"
        }
      >
        {items.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-neutral-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          items.map((notice) => (
            <Link
              key={notice.id}
              href={`/admin/notices/${notice.id}`}
              className="block rounded-md border p-4 transition-colors hover:bg-neutral-50"
            >
              <p className="font-medium">{notice.title}</p>
              {notice.summary?.trim() ? (
                <p className="mt-1 text-sm text-neutral-600">
                  {notice.summary.trim()}
                </p>
              ) : null}
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

        <InfiniteSentinel
          hasMore={Boolean(hasNextPage)}
          onLoadMore={handleLoadMore}
          disabled={isFetchingNextPage}
        />
      </div>
    </div>
  )
}
