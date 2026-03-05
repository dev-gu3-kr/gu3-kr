import { EventManagerContainer } from "@/features/events/client"

export default function AdminEventsPage() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">일정관리</h1>
        <p className="text-sm text-neutral-600">
          스케줄러와 리스트 모드로 일정을 등록/조회/관리합니다.
        </p>
      </section>

      <EventManagerContainer />
    </main>
  )
}
