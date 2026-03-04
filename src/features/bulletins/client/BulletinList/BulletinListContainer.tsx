"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { apiFetch } from "@/lib/api"

type BulletinPublishFilter = "all" | "published" | "draft"

type BulletinListItemDto = {
  id: string
  title: string
  isPublished: boolean
  createdAt: string
  attachments: Array<{
    url: string
    originalName: string
  }>
}

type BulletinListResponseDto = {
  ok?: boolean
  items?: BulletinListItemDto[]
  pageInfo?: {
    hasMore: boolean
    nextCursor: string | null
  }
}

export function BulletinListContainer({
  initialItems,
  initialNextCursor,
  initialHasMore,
}: {
  initialItems: BulletinListItemDto[]
  initialNextCursor: string | null
  initialHasMore: boolean
}) {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<BulletinPublishFilter>("all")

  const [items, setItems] = useState(initialItems)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isFilterFetching, setIsFilterFetching] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const didMountRef = useRef(false)

  // 검색 입력은 즉시 반영하지 않고 300ms 디바운스로 서버 요청 횟수를 줄인다.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(queryInput)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [queryInput])

  // 필터/검색이 바뀌면 첫 페이지를 다시 조회해 목록 상태를 초기화한다.
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    const run = async () => {
      setIsFilterFetching(true)
      try {
        const response = await apiFetch
          .get("/api/admin/bulletins")
          .query({ take: 20, query: query || undefined, status })
          .send()

        const json = (await response
          .json()
          .catch(() => null)) as BulletinListResponseDto | null
        if (!response.ok || !json?.ok || !Array.isArray(json.items)) {
          setItems([])
          setHasMore(false)
          setNextCursor(null)
          return
        }

        setItems(json.items)
        setHasMore(Boolean(json.pageInfo?.hasMore))
        setNextCursor(json.pageInfo?.nextCursor ?? null)
      } finally {
        setIsFilterFetching(false)
      }
    }

    void run()
  }, [query, status])

  const canLoadMore = useMemo(
    () => hasMore && !!nextCursor && !isLoadingMore && !isFilterFetching,
    [hasMore, nextCursor, isLoadingMore, isFilterFetching],
  )

  // 하단 sentinel이 보이면 다음 페이지를 자동으로 이어서 불러온다(인피니티 스크롤).
  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || !canLoadMore) return

        setIsLoadingMore(true)
        try {
          const response = await apiFetch
            .get("/api/admin/bulletins")
            .query({
              take: 20,
              cursor: nextCursor,
              query: query || undefined,
              status,
            })
            .send()

          const json = (await response
            .json()
            .catch(() => null)) as BulletinListResponseDto | null
          if (!response.ok || !json?.ok || !Array.isArray(json.items)) {
            return
          }

          setItems((prev) => {
            const known = new Set(prev.map((item) => item.id))
            const merged = [...prev]
            for (const item of json.items || []) {
              if (!known.has(item.id)) merged.push(item)
            }
            return merged
          })

          setHasMore(Boolean(json.pageInfo?.hasMore))
          setNextCursor(json.pageInfo?.nextCursor ?? null)
        } finally {
          setIsLoadingMore(false)
        }
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoadMore, nextCursor, query, status])

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

          {isFilterFetching || isLoadingMore ? (
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

        {isFilterFetching || isLoadingMore ? (
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            불러오는 중
          </p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-md border">
        {items.length === 0 ? (
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
                  {/* 행 전체를 클릭 타겟으로 만들어 제목 외 영역에서도 상세로 진입할 수 있게 한다. */}
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

        <div ref={sentinelRef} className="h-1" />
      </section>
    </div>
  )
}
