import { AppLink as Link } from "@/components/AppLink"
import { EventEditFormContainer } from "@/features/events/client"

export default async function AdminEventEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
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
        <EventEditFormContainer eventId={id} />
      </section>
    </main>
  )
}
