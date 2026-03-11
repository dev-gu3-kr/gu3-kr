"use client"

import { useParams } from "next/navigation"

import { usePublicNoticeDetailQuery } from "@/features/notices/isomorphic"
import { PublicNoticeDetailView } from "./PublicNoticeDetailView"

export function PublicNoticeDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data, isLoading, isError } = usePublicNoticeDetailQuery(id)

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
        공지사항 상세를 불러오지 못했습니다.
      </section>
    )
  }

  return (
    <PublicNoticeDetailView detail={data.item} navigation={data.navigation} />
  )
}
