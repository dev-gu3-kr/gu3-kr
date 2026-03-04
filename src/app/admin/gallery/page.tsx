import Link from "next/link"
import { GalleryListContainer } from "@/features/gallery/client"
import type { GalleryListItemDto } from "@/features/gallery/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

type GalleryListResponseDto = {
  ok?: boolean
  items?: GalleryListItemDto[]
  pageInfo?: { hasMore: boolean; nextCursor: string | null }
}

export default async function AdminGalleryPage() {
  const response = await serverApiFetch
    .get("/api/admin/gallery")
    .query({ take: 20 })
    .send()
  const json = (await response
    .json()
    .catch(() => null)) as GalleryListResponseDto | null
  const items = json?.ok && Array.isArray(json.items) ? json.items : []
  const hasMore = Boolean(json?.pageInfo?.hasMore)
  const nextCursor = json?.pageInfo?.nextCursor ?? null

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">갤러리 관리</h1>
          <p className="text-sm text-neutral-600">
            카드형 목록으로 갤러리를 관리합니다.
          </p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>

      <GalleryListContainer
        initialItems={items}
        initialHasMore={hasMore}
        initialNextCursor={nextCursor}
      />
    </main>
  )
}
