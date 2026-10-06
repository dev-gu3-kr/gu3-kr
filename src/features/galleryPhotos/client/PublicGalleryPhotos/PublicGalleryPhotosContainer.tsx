"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import {
  useGalleryPhotoDetail,
  useGalleryPhotos,
} from "@/features/galleryPhotos/isomorphic"
import { PublicGalleryPhotosView } from "./PublicGalleryPhotosView"

export function PublicGalleryPhotosContainer({ postId }: { postId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const photoId = search.get("photo") ?? ""
  const photos = useGalleryPhotos(postId)
  const detail = useGalleryPhotoDetail(postId, photoId)
  const items = photos.data?.pages.flatMap((page) => page.items) ?? []

  function selectPhoto(id: string | null) {
    const params = new URLSearchParams(search.toString())
    if (id) params.set("photo", id)
    else params.delete("photo")
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    })
  }

  useEffect(() => {
    if (!photoId) return
    function handleKey(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      if ((event.target as HTMLElement)?.closest("input, textarea, select"))
        return
      const id =
        event.key === "ArrowLeft"
          ? detail.data?.previousId
          : detail.data?.nextId
      if (!id) return
      event.preventDefault()
      const params = new URLSearchParams(search.toString())
      params.set("photo", id)
      router.replace(`${pathname}?${params}`, { scroll: false })
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [detail.data, photoId, pathname, router, search])

  return (
    <PublicGalleryPhotosView
      items={items}
      totalCount={photos.data?.pages[0]?.totalCount ?? 0}
      isLoading={photos.isLoading}
      isError={photos.isError}
      onRetry={() => {
        void photos.refetch()
      }}
      hasMore={Boolean(photos.hasNextPage)}
      isLoadingMore={photos.isFetchingNextPage}
      onLoadMore={() => {
        void photos.fetchNextPage()
      }}
      isViewerOpen={Boolean(photoId)}
      detail={detail.data ?? null}
      isViewerLoading={detail.isLoading}
      isViewerError={detail.isError}
      onSelectPhoto={selectPhoto}
      onClose={() => selectPhoto(null)}
      onRetryDetail={() => {
        void detail.refetch()
      }}
    />
  )
}
