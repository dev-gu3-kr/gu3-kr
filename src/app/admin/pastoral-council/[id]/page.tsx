"use client"

import { useQuery } from "@tanstack/react-query"
import { BadgeCheck, BriefcaseBusiness, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { PastoralCouncilDeleteButton } from "@/features/pastoral-council/client"
import type { PastoralCouncilDetailDto } from "@/features/pastoral-council/isomorphic"
import { apiFetch } from "@/lib/api"

type DetailResponse = { ok?: boolean; item?: PastoralCouncilDetailDto }

export default function AdminPastoralCouncilViewPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "pastoral-council", "detail", id],
    enabled: id.length > 0,
    queryFn: async () => {
      const response = await apiFetch
        .get(`/api/admin/pastoral-council/${id}`)
        .send()
      if (!response.ok)
        throw new Error("사목협의회 상세를 불러오지 못했습니다.")
      const json = (await response
        .json()
        .catch(() => null)) as DetailResponse | null
      if (!json?.ok || !json.item)
        throw new Error("사목협의회 상세를 불러오지 못했습니다.")
      return json.item
    },
  })

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="rounded-xl bg-white p-5">불러오는 중...</section>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="space-y-6">
        <section className="rounded-xl bg-white p-5 text-sm text-red-600">
          사목협의회 상세를 불러오지 못했습니다.
        </section>
      </main>
    )
  }

  const item = data
  const displayName = item.baptismalName
    ? `${item.name} · ${item.baptismalName}`
    : item.name

  return (
    <main className="space-y-6">
      <section className="space-y-6 rounded-xl bg-white p-5">
        <Link
          href="/admin/pastoral-council"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>

        <div className="mx-auto mt-2 flex w-full max-w-3xl flex-col items-center gap-5 sm:mt-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={`${item.name} 프로필`}
              unoptimized
              width={260}
              height={320}
              sizes="260px"
              className="h-[320px] w-[260px] rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[320px] w-[260px] items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-400">
              이미지 없음
            </div>
          )}

          <h1 className="text-center text-3xl font-normal">{displayName}</h1>

          <div className="w-full max-w-xl">
            <div className="mx-auto grid w-fit gap-y-4">
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">담당영역</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.duty}
                </p>
              </div>
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">연락처</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.phone}
                </p>
              </div>
              <div className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <p className="text-sm text-neutral-500">상태</p>
                <p className="text-lg font-normal text-neutral-900">
                  {item.isActive ? "활성" : "비활성"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Link
              href={`/admin/pastoral-council/${item.id}/edit`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              수정
            </Link>
            <PastoralCouncilDeleteButton memberId={item.id} />
          </div>
        </div>
      </section>
    </main>
  )
}
