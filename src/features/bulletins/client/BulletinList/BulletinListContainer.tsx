"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  type BulletinPublishFilterDto,
  useBulletinListInfinite,
} from "@/features/bulletins/isomorphic"
import { BulletinListView } from "./BulletinListView"

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
    <BulletinListView
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
