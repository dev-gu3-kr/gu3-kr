"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type BulletinPublishFilterDto,
  useBulletinListInfinite,
} from "@/features/bulletins/isomorphic"

export function BulletinListContainer() {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<BulletinPublishFilterDto>("all")

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(queryInput.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [queryInput])

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    fetchNextPage,
    hasNextPage,
  } = useBulletinListInfinite({ filters: { query, status } })

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  )

  const isFilterFetching = isFetching && !isFetchingNextPage

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

      <section className="overflow-hidden rounded-md border">
        {isLoading && items.length === 0 ? (
          <ul className="divide-y">
            {["b-sk-1", "b-sk-2", "b-sk-3", "b-sk-4"].map((key) => (
              <li key={key} className="animate-pulse px-4 py-4">
                <div className="h-5 w-2/3 rounded bg-neutral-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
              </li>
            ))}
          </ul>
        ) : isError && items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-red-600">
            주보 목록을 불러오지 못했습니다.
          </p>
        ) : items.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-500">
            등록된 본당주보가 없습니다.
          </p>
        ) : (
          <ul className="divide-y">
            {items.map((item) => {
              const attachment = item.attachments[0]
              return (
                <li
                  key={item.id}
                  className="relative flex items-center justify-between gap-3 px-4 py-4 text-sm"
                >
                  <Link
                    href={`/admin/bulletins/${item.id}`}
                    aria-label={`${item.title} 상세 보기`}
                    className="absolute inset-0 z-0 rounded-md"
                  />

                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-sm text-neutral-500">
                      {item.isPublished ? "공개" : "비공개"} ·{" "}
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>

                  {attachment ? (
                    <a
                      href={`/api/admin/bulletins/${item.id}/download`}
                      className="relative z-10 shrink-0 rounded-md border px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
                    >
                      파일 다운로드
                    </a>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}

        <InfiniteSentinel
          hasMore={Boolean(hasNextPage)}
          onLoadMore={handleLoadMore}
          disabled={isFetchingNextPage}
        />
      </section>
    </div>
  )
}
