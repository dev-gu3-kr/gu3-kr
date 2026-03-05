import { AppLink as Link } from "@/components/AppLink"
import { NoticeWriteFormContainer } from "@/features/notices/client"

export default function AdminNoticeNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">공지사항 작성</h1>
          <p className="text-sm text-neutral-600">새 공지사항을 작성합니다.</p>
        </div>

        <Link
          href="/admin/notices"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <NoticeWriteFormContainer />
      </section>
    </main>
  )
}
