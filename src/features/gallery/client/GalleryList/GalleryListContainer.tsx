"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { GalleryPublishFilterDto } from "@/features/gallery/isomorphic"
import { useGalleryListInfinite } from "@/features/gallery/isomorphic"

export function GalleryListContainer() {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<GalleryPublishFilterDto>("all")
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [queryInput])

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGalleryListInfinite({
    filters: { query, status },
  })

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  )
  const [loadedImageIds, setLoadedImageIds] = useState<Set<string>>(
    () => new Set(),
  )

  useEffect(() => {
    setLoadedImageIds((prev) => {
      const next = new Set<string>()
      for (const item of items) {
        if (prev.has(item.id)) next.add(item.id)
      }
      return next
    })
  }, [items])

  const isFilterFetching = isFetching && !isFetchingNextPage

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0]
        if (!firstEntry?.isIntersecting || !hasNextPage || isFetchingNextPage)
          return
        await fetchNextPage()
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

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
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {["g-sk-1", "g-sk-2", "g-sk-3", "g-sk-4", "g-sk-5", "g-sk-6"].map(
            (key) => (
              <li
                key={key}
                className="animate-pulse overflow-hidden rounded-md border"
              >
                <div className="aspect-[16/9] bg-neutral-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-5/6 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-200" />
                </div>
              </li>
            ),
          )}
        </ul>
      ) : isError && items.length === 0 ? (
        <p className="text-sm text-red-600">
          갤러리 목록을 불러오지 못했습니다.
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-neutral-500">
          검색 결과가 없습니다.
        </div>
      ) : (
        <ul
          className={
            isFilterFetching
              ? "pointer-events-none grid grid-cols-1 gap-3 opacity-60 lg:grid-cols-2 xl:grid-cols-3"
              : "grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3"
          }
        >
          {items.map((item, index) => (
            <li key={item.id} className="overflow-hidden rounded-md border">
              <Link href={`/admin/gallery/${item.id}`} className="block">
                <div className="relative aspect-[16/9] bg-neutral-100">
                  {item.thumbnailUrl ? (
                    <>
                      {!loadedImageIds.has(item.id) ? (
                        <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                      ) : null}
                      <Image
                        src={item.thumbnailUrl}
                        alt=""
                        width={1600}
                        height={900}
                        sizes="(max-width: 1024px) 100vw, (max-width: 1536px) 50vw, 33vw"
                        priority={index < 2}
                        className={
                          loadedImageIds.has(item.id)
                            ? "h-full w-full object-cover opacity-100 transition-opacity duration-200"
                            : "h-full w-full object-cover opacity-0 transition-opacity duration-200"
                        }
                        onLoad={() => {
                          setLoadedImageIds((prev) =>
                            new Set(prev).add(item.id),
                          )
                        }}
                      />
                    </>
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
