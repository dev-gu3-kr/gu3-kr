import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPastoralCouncilLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">사목협의회 관리</h1>
          <p className="text-sm text-neutral-600">
            사목협의회 위원 정보를 확인하고 등록/수정합니다.
          </p>
        </div>
      </section>
      <div className="space-y-2">
        {["a", "b", "c"].map((k) => (
          <Skeleton key={k} className="h-36 w-full" />
        ))}
      </div>
    </main>
  )
}
