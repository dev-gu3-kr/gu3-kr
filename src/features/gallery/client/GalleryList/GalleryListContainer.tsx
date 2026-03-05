"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GalleryListItemDto } from "@/features/gallery/isomorphic"
import { apiFetch } from "@/lib/api"

type GalleryPublishFilter = "all" | "published" | "draft"

type GalleryListResponseDto = {
  ok?: boolean
  items?: GalleryListItemDto[]
  pageInfo?: { hasMore: boolean; nextCursor: string | null }
}

export function GalleryListContainer({
  initialItems = [],
  initialHasMore = false,
  initialNextCursor = null,
}: {
  initialItems?: GalleryListItemDto[]
  initialHasMore?: boolean
  initialNextCursor?: string | null
} = {}) {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<GalleryPublishFilter>("all")

  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isFilterFetching, setIsFilterFetching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [queryInput])

  useEffect(() => {
    const run = async () => {
      setIsFilterFetching(true)
      try {
        const response = await apiFetch
          .get("/api/admin/gallery")
          .query({ take: 20, query: query || undefined, status })
          .send()
        const json = (await response
          .json()
          .catch(() => null)) as GalleryListResponseDto | null

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

  const canLoadMore =
    hasMore && !!nextCursor && !isLoadingMore && !isFilterFetching

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || !canLoadMore) return

        setIsLoadingMore(true)
        try {
          const response = await apiFetch
            .get("/api/admin/gallery")
            .query({
              take: 20,
              cursor: nextCursor,
              query: query || undefined,
              status,
            })
            .send()
          const json = (await response
            .json()
            .catch(() => null)) as GalleryListResponseDto | null

          if (!response.ok || !json?.ok || !Array.isArray(json.items)) return

          setItems((prev) => {
            const known = new Set(prev.map((x) => x.id))
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
            <ToggleGroupItem value="all">전체</ToggleGroupItem>
            <ToggleGroupItem value="published">공개</ToggleGroupItem>
            <ToggleGroupItem value="draft">비공개</ToggleGroupItem>
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
            onChange={(e) => setQueryInput(e.target.value)}
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

      {items.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-neutral-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-md border">
              <Link href={`/admin/gallery/${item.id}`} className="block">
                <div className="aspect-[16/9] bg-neutral-100">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt=""
                      width={1600}
                      height={900}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      썸네일 없음
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-sm font-medium">
                    {item.title}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {item.isPublished ? "공개" : "비공개"} ·{" "}
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
