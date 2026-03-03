import Link from "next/link"
import { NunFormContainer } from "@/features/clergy-nuns/client"

export default function AdminNunNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 등록</h1>
          <p className="text-sm text-neutral-600">수녀님 소개를 등록합니다.</p>
        </div>
        <Link
          href="/admin/clergy/nuns"
          className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <NunFormContainer mode="create" />
      </section>
    </main>
  )
}
