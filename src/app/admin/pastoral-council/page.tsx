import { AppLink as Link } from "@/components/AppLink"
import { PastoralCouncilListContainer } from "@/features/pastoral-council/client"

export default function AdminPastoralCouncilPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">사목협의회 관리</h1>
          <p className="text-sm text-neutral-600">
            사목협의회 위원 정보를 확인하고 등록/수정합니다.
          </p>
        </div>
        <Link
          href="/admin/pastoral-council/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>

      <PastoralCouncilListContainer />
    </main>
  )
}
