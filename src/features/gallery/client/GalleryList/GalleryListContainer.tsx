"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type { GalleryPublishFilterDto } from "@/features/gallery/isomorphic"
import { useGalleryListInfinite } from "@/features/gallery/isomorphic"
import { GalleryListView } from "./GalleryListView"

export function GalleryListContainer() {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<GalleryPublishFilterDto>("all")

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
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(
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

    setFailedImageIds((prev) => {
      const next = new Set<string>()
      for (const item of items) {
        if (prev.has(item.id)) next.add(item.id)
      }
      return next
    })
  }, [items])

  const isFilterFetching = isFetching && !isFetchingNextPage

  const handleLoadMore = useCallback(async () => {
    await fetchNextPage()
  }, [fetchNextPage])

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImageIds((prev) => new Set(prev).add(id))
  }, [])

  const handleImageError = useCallback((id: string) => {
    setFailedImageIds((prev) => new Set(prev).add(id))
  }, [])

  return (
    <GalleryListView
      queryInput={queryInput}
      status={status}
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFilterFetching={isFilterFetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      loadedImageIds={loadedImageIds}
      failedImageIds={failedImageIds}
      onQueryInputChange={setQueryInput}
      onStatusChange={setStatus}
      onLoadMore={handleLoadMore}
      onImageLoad={handleImageLoad}
      onImageError={handleImageError}
    />
  )
}
