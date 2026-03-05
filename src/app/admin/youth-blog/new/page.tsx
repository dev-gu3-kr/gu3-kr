import Link from "next/link"
import { YouthBlogWriteFormContainer } from "@/features/youth-blog/client"

export default function AdminYouthBlogNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">청소년 블로그 작성</h1>
          <p className="text-sm text-neutral-600">
            새 청소년 블로그 글을 작성합니다.
          </p>
        </div>

        <Link
          href="/admin/youth-blog"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <YouthBlogWriteFormContainer />
      </section>
    </main>
  )
}
