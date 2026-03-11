"use client"

import { useSearchParams } from "next/navigation"
import { useMemo } from "react"

import { usePublicGalleryPageQuery } from "@/features/gallery/isomorphic"
import { PublicGalleryListView } from "./PublicGalleryListView"

export function PublicGalleryListContainer() {
  const searchParams = useSearchParams()
  const query = (searchParams.get("q") || "").trim()
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1)

  const { data, isLoading, isError } = usePublicGalleryPageQuery({
    page,
    query,
  })

  const pageNumbers = useMemo(() => {
    const totalPages = data?.totalPages ?? 1
    const currentPage = data?.currentPage ?? 1
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, start + 4)

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [data?.currentPage, data?.totalPages])

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        로딩 중...
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
        갤러리 목록을 불러오지 못했습니다.
      </section>
    )
  }

  return (
    <PublicGalleryListView
      items={data.items}
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      pageNumbers={pageNumbers}
      query={query}
    />
  )
}
