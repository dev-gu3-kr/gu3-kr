import Link from "next/link"
import { EventWriteFormContainer } from "@/features/events/client"

export default function AdminEventNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">일정 등록</h1>
          <p className="text-sm text-neutral-600">새 일정을 등록합니다.</p>
        </div>

        <Link
          href="/admin/events"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-md border p-4">
        <EventWriteFormContainer />
      </section>
    </main>
  )
}
