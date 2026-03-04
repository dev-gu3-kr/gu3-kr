import Link from "next/link"
import { notFound } from "next/navigation"
import { EventEditFormContainer } from "@/features/events/client"
import { serverApiFetch } from "@/lib/api-server"

type EventDetailDto = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  isPublished: boolean
}

function toDateTimeLocal(text: string) {
  const d = new Date(text)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default async function AdminEventEditPage(props: {
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

  return (
    <main className="space-y-4">
      <Link
        href={`/admin/events/${id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← 상세로 돌아가기
      </Link>

      <h1 className="text-2xl font-semibold">일정 수정</h1>
      <p className="text-sm text-neutral-600">제목, 내용, 기간을 수정합니다.</p>

      <section className="rounded-md border p-4">
        <EventEditFormContainer
          eventId={item.id}
          initialValues={{
            title: item.title,
            description: item.description || "",
            startsAt: toDateTimeLocal(item.startsAt),
            endsAt: toDateTimeLocal(item.endsAt),
            isPublished: item.isPublished,
          }}
        />
      </section>
    </main>
  )
}
