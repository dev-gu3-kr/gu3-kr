"use client"

import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { useParams } from "next/navigation"
import { EventDeleteButton } from "@/features/events/client"
import { useEventDetailQuery } from "@/features/events/isomorphic"

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data: item, isLoading, isError } = useEventDetailQuery(id)

  if (isLoading)
    return (
      <main className="space-y-6">
        <section className="space-y-2">
          <Link
            href="/admin/events"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로
          </Link>
          <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-neutral-200" />
        </section>
        <section className="space-y-1">
          <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-72 animate-pulse rounded bg-neutral-200" />
        </section>
        <section className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
          </div>
        </section>
        <section className="flex items-center gap-2">
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
        </section>
      </main>
    )
  if (isError || !item)
    return (
      <main className="space-y-6">
        <section className="rounded-md border p-4 text-sm text-red-600">
          일정 상세를 불러오지 못했습니다.
        </section>
      </main>
    )

  const startsAtText = format(new Date(item.startsAt), "yyyy.MM.dd HH:mm", {
    locale: ko,
  })
  const endsAtText = format(new Date(item.endsAt), "yyyy.MM.dd HH:mm", {
    locale: ko,
  })
  const isSamePeriod = item.startsAt === item.endsAt

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <Link
          href="/admin/events"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <p className="text-sm text-neutral-600">
          {item.isPublished ? "공개" : "비공개"} ·{" "}
          {formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </section>

      <section className="space-y-1">
        <h2 className="text-sm font-semibold text-neutral-700">기간</h2>
        <p className="text-sm text-neutral-600">
          {isSamePeriod ? startsAtText : `${startsAtText} ~ ${endsAtText}`}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700">내용</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
          {item.description || "내용 없음"}
        </p>
      </section>

      <section className="flex items-center gap-2">
        <Link
          href={`/admin/events/${item.id}/edit`}
          className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          수정
        </Link>
        <EventDeleteButton eventId={item.id} />
      </section>
    </main>
  )
}
