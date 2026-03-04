import { EventManagerContainer } from "@/features/events/client"
import type { EventListItemDto } from "@/features/events/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type EventListResponseDto = {
  ok?: boolean
  items?: EventListItemDto[]
  pageInfo?: {
    hasMore: boolean
    nextCursor: string | null
  }
}

export default async function AdminEventsPage() {
  const response = await serverApiFetch
    .get("/api/admin/events")
    .query({ take: 20 })
    .send()

  const json = (await response
    .json()
    .catch(() => null)) as EventListResponseDto | null

  const items = json?.ok && Array.isArray(json.items) ? json.items : []
  const hasMore = Boolean(json?.pageInfo?.hasMore)
  const nextCursor = json?.pageInfo?.nextCursor ?? null

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">일정관리</h1>
        <p className="text-sm text-neutral-600">
          스케줄러와 리스트 모드로 일정을 등록/조회/관리합니다.
        </p>
      </section>

      <EventManagerContainer
        initialItems={items}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
      />
    </main>
  )
}
