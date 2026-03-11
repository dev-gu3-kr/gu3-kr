"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type {
  ApiResponseDto,
  NoticePageDto,
  NoticePublishFilterDto,
} from "@/features/notices/isomorphic"
import { useNoticeListInfinite } from "@/features/notices/isomorphic"
import { NoticeListView } from "./NoticeListView"

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
    <NoticeListView
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
