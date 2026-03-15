"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import type {
  InquiryStatusFilterDto,
  InquiryTypeFilterDto,
} from "@/features/inquiries/isomorphic"
import { useInquiryListInfinite } from "@/features/inquiries/isomorphic"
import { InquiryListView } from "./InquiryListView"

export function InquiryListContainer() {
  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<InquiryStatusFilterDto>("all")
  const [inquiryType, setInquiryType] = useState<InquiryTypeFilterDto>("all")

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
  } = useInquiryListInfinite({
    filters: { query, status, inquiryType },
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
    <InquiryListView
      queryInput={queryInput}
      status={status}
      inquiryType={inquiryType}
      items={items}
      isLoading={isLoading}
      isError={isError}
      isFilterFetching={isFilterFetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={Boolean(hasNextPage)}
      onQueryInputChange={setQueryInput}
      onStatusChange={setStatus}
      onInquiryTypeChange={setInquiryType}
      onLoadMore={handleLoadMore}
    />
  )
}
