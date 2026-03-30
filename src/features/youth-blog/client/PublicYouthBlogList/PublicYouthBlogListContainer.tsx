"use client"

import { useSearchParams } from "next/navigation"
import { usePublicYouthBlogListInfinite } from "@/features/youth-blog/isomorphic"
import { PublicYouthBlogListView } from "./PublicYouthBlogListView"

export function PublicYouthBlogListContainer() {
  const searchParams = useSearchParams()
  const query = (searchParams.get("q") || "").trim()

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePublicYouthBlogListInfinite({
    query,
  })
  const items = data?.pages.flatMap((pageData) => pageData.items) ?? []

  if (isLoading) {
    return <PublicYouthBlogListView items={[]} isLoading />
  }

  return (
    <PublicYouthBlogListView
      items={items}
      isError={isError}
      isLoading={false}
      hasNextPage={Boolean(hasNextPage)}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={async () => {
        if (!hasNextPage || isFetchingNextPage) return
        await fetchNextPage()
      }}
    />
  )
}
