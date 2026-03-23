"use client"

import { useParams } from "next/navigation"

import { usePublicGalleryDetailQuery } from "@/features/gallery/isomorphic"
import { PublicGalleryDetailView } from "./PublicGalleryDetailView"

export function PublicGalleryDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data, isLoading, isError } = usePublicGalleryDetailQuery(id)

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
        갤러리 상세를 불러오지 못했습니다.
      </section>
    )
  }

  return (
    <PublicGalleryDetailView detail={data.item} navigation={data.navigation} />
  )
}
