import Link from "next/link"
import { NoticeListContainer } from "@/features/notices/client"

export default function AdminNoticesPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">공지사항 관리</h1>
          <p className="text-sm text-neutral-600">
            공지사항 목록을 확인하고 등록/수정합니다.
          </p>
        </div>

        <Link
          href="/admin/notices/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 글쓰기
        </Link>
      </section>

      <NoticeListContainer />
    </main>
  )
}
