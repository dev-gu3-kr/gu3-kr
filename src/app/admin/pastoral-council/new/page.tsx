import { AppLink as Link } from "@/components/AppLink"
import { PastoralCouncilFormContainer } from "@/features/pastoral-council/client"

export default function AdminPastoralCouncilNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">사목협의회 위원 등록</h1>
          <p className="text-sm text-neutral-600">
            사목협의회 위원 정보를 등록합니다.
          </p>
        </div>
        <Link
          href="/admin/pastoral-council"
          className="inline-flex rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>
      <section className="rounded-lg border p-4">
        <PastoralCouncilFormContainer mode="create" />
      </section>
    </main>
  )
}
