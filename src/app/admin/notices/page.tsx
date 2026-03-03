import Link from "next/link"
import { NoticeListContainer } from "@/features/notices/client"
import type {
  ApiResponseDto,
  NoticePageDto,
} from "@/features/notices/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminNoticesPage() {
  // 첫 페이지 데이터를 SSR에서 미리 조회해 클라이언트 초기 렌더에 사용한다.
  const response = await serverApiFetch
    .get("/api/admin/notices")
    .query({ take: 10 })
    .send()

  const initialPage = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<NoticePageDto> | null

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">공지사항 관리</h1>
          <p className="text-sm text-neutral-600">
            공지사항 목록을 확인하고 등록/수정합니다.
          </p>
        </div>

        <Link
          href="/admin/notices/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 글쓰기
        </Link>
      </section>

      <NoticeListContainer
        initialPage={initialPage?.ok ? initialPage : undefined}
      />
    </main>
  )
}
