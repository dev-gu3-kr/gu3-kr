import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EventDeleteButton } from "@/features/events/client"
import { serverApiFetch } from "@/lib/api-server"

type EventDetailDto = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  isPublished: boolean
  createdAt: string
}

export default async function AdminEventDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const response = await serverApiFetch.get(`/api/admin/events/${id}`).send()
  if (response.status === 404) notFound()

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: EventDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) notFound()

  const item = json.item
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
