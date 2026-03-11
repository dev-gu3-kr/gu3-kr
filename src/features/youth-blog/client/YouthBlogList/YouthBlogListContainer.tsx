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

  const handleLoadMore = useCallback(async () => {
    await fetchNextPage()
  }, [fetchNextPage])

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
      onQueryInputChange={setQueryInput}
      onStatusChange={setStatus}
      onLoadMore={handleLoadMore}
    />
  )
}
