"use client"

import { useParams } from "next/navigation"
import { usePublicBulletinDetailQuery } from "@/features/bulletins/isomorphic"
import { PublicBulletinDetailView } from "./PublicBulletinDetailView"

export function PublicBulletinDetailContainer() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data, isLoading, isError } = usePublicBulletinDetailQuery(id)

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
        본당주보 상세를 불러오지 못했습니다.
      </section>
    )
  }

  return (
    <PublicBulletinDetailView detail={data.item} navigation={data.navigation} />
  )
}
