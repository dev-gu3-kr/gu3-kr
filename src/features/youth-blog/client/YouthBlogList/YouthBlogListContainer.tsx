"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  ApiResponseDto,
  YouthBlogPageDto,
  YouthBlogPublishFilterDto,
} from "@/features/youth-blog/isomorphic"
import { useYouthBlogListInfinite } from "@/features/youth-blog/isomorphic"
import { YouthBlogListView } from "./YouthBlogListView"

type YouthBlogPageResponse = ApiResponseDto<YouthBlogPageDto>

type YouthBlogListContainerProps = {
  initialPage?: YouthBlogPageResponse
}

export function YouthBlogListContainer({
  initialPage,
}: YouthBlogListContainerProps) {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<YouthBlogPublishFilterDto>("all")

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
  } = useYouthBlogListInfinite({
    initialPage,
    filters: { query, status },
  })

  const isFilterFetching = isFetching && !isFetchingNextPage

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
    <YouthBlogListView
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
