import Link from "next/link"
import { NoticeListContainer } from "@/features/youth-blog/client"
import type {
  ApiResponseDto,
  NoticePageDto,
} from "@/features/youth-blog/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminYouthBlogPage() {
  const response = await serverApiFetch
    .get("/api/admin/youth-blog")
    .query({ take: 10 })
    .send()

  const initialPage = (await response
    .json()
    .catch(() => null)) as ApiResponseDto<NoticePageDto> | null

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">청소년 블로그 관리</h1>
          <p className="text-sm text-neutral-600">
            청소년 블로그 목록을 확인하고 등록/수정합니다.
          </p>
        </div>

        <Link
          href="/admin/youth-blog/new"
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
