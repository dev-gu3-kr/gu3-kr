"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import {
  archivePhotoYearSchema,
  usePublicArchivePhotoDetail,
  usePublicPhotoArchiveInfinite,
} from "@/features/photoArchive/isomorphic"
import { PublicPhotoArchivePageView } from "./PublicPhotoArchivePageView"

type FilterValues = { year: number | null }

export function PublicPhotoArchivePageContainer() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const yearResult = archivePhotoYearSchema.safeParse(
    Number(searchParams.get("year")),
  )
  const initialYear = yearResult.success ? yearResult.data : null
  const filterForm = useForm<FilterValues>({
    defaultValues: { year: initialYear },
  })
  const year = filterForm.watch("year")
  const query = usePublicPhotoArchiveInfinite(year)
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  )
  const years = query.data?.pages[0]?.years ?? []
  const selectedPhotoId = searchParams.get("photo")
  const selectedIndex = selectedPhotoId
    ? items.findIndex((item) => item.id === selectedPhotoId)
    : -1
  const detailQuery = usePublicArchivePhotoDetail(
    selectedPhotoId ?? "",
    selectedIndex < 0,
  )
  const selectedPhoto =
    selectedIndex >= 0
      ? (items[selectedIndex] ?? null)
      : (detailQuery.data ?? null)

  const updateUrl = useCallback(
    (
      next: { year?: number | null; photoId?: string | null },
      history: "push" | "replace" = "replace",
    ) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next.year !== undefined) {
        if (next.year === null) params.delete("year")
        else params.set("year", String(next.year))
      }
      if (next.photoId !== undefined) {
        if (next.photoId === null) params.delete("photo")
        else params.set("photo", next.photoId)
      }
      const queryString = params.toString()
      router[history](queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams],
  )

  const selectPhotoAt = useCallback(
    (index: number) => {
      const photo = items[index]
      if (photo) updateUrl({ photoId: photo.id })
    },
    [items, updateUrl],
  )

  useEffect(() => {
    if (!selectedPhoto) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && selectedIndex > 0) {
        selectPhotoAt(selectedIndex - 1)
      }
      if (event.key === "ArrowRight" && selectedIndex < items.length - 1) {
        selectPhotoAt(selectedIndex + 1)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items.length, selectPhotoAt, selectedIndex, selectedPhoto])

  const handleLoadMore = useCallback(async () => {
    await query.fetchNextPage()
  }, [query.fetchNextPage])

  return (
    <PublicPhotoArchivePageView
      items={items}
      years={years}
      year={year}
      selectedPhoto={selectedPhoto}
      selectedIndex={selectedIndex}
      isLoading={query.isLoading}
      isError={query.isError}
      isFetching={query.isFetching && !query.isFetchingNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      hasNextPage={Boolean(query.hasNextPage)}
      onYearChange={(nextYear) => {
        filterForm.setValue("year", nextYear)
        updateUrl({ year: nextYear, photoId: null }, "push")
      }}
      onSelectPhoto={(photoId) => updateUrl({ photoId }, "push")}
      onCloseViewer={() => updateUrl({ photoId: null })}
      onPrevious={() => selectPhotoAt(selectedIndex - 1)}
      onNext={() => selectPhotoAt(selectedIndex + 1)}
      onLoadMore={handleLoadMore}
    />
  )
}
