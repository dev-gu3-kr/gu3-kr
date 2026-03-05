"use client"

import {
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  HeartPulse,
  Smartphone,
} from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { AppLink as Link } from "@/components/AppLink"
import { NunDeleteButton } from "@/features/clergy-nuns/client"
import { useNunDetailQuery } from "@/features/clergy-nuns/isomorphic"

export default function AdminNunViewPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")

  const { data, isLoading, isError } = useNunDetailQuery(id)

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="space-y-6 rounded-xl bg-white p-5">
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />

          <div className="mx-auto mt-2 flex w-full max-w-3xl flex-col items-center gap-5 sm:mt-0">
            <div className="h-[320px] w-[260px] animate-pulse rounded-xl bg-neutral-200" />
            <div className="h-9 w-64 animate-pulse rounded bg-neutral-200" />

            <div className="w-full max-w-xl">
              <div className="mx-auto grid w-fit gap-y-4">
                {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"].map((key) => (
                  <div
                    key={key}
                    className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3"
                  >
                    <div className="h-5 w-5 animate-pulse rounded bg-neutral-200" />
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                    <div className="h-5 w-44 animate-pulse rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
              <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="space-y-6">
        <section className="rounded-xl bg-white p-5 text-sm text-red-600">
          수녀님 상세를 불러오지 못했습니다.
        </section>
      </main>
    )
  }

  const item = data
  const displayName = item.baptismalName
    ? `${item.name} · ${item.baptismalName}`
    : item.name

  const fields = [
    { label: "담당영역", value: item.duty || "-", Icon: BriefcaseBusiness },
    {
      label: "축일",
      value: `${item.feastMonth ?? "-"}월 ${item.feastDay ?? "-"}일`,
      Icon: Calendar,
    },
    {
      label: "재임기간",
      value: `${item.termStart ? item.termStart.slice(0, 10) : "-"} ~ ${item.termEnd ? item.termEnd.slice(0, 10) : "현재"}`,
      Icon: HeartPulse,
    },
    {
      label: "현직 여부",
      value: item.isCurrent ? "현직" : "전직",
      Icon: BadgeCheck,
    },
    { label: "연락처", value: item.phone ?? "-", Icon: Smartphone },
  ]

  return (
    <main className="space-y-6">
      <section className="space-y-6 rounded-xl bg-white p-5">
        <Link
          href="/admin/clergy/nuns"
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
              {fields.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-sm text-neutral-500">{label}</p>
                  <p className="text-lg font-normal text-neutral-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Link
              href={`/admin/clergy/nuns/${item.id}/edit`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              수정
            </Link>
            <NunDeleteButton nunId={item.id} />
          </div>
        </div>
      </section>
    </main>
  )
}
