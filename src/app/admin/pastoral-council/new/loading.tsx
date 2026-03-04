import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPastoralCouncilNewLoading() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">사목협의회 위원 등록</h1>
      <section className="rounded-lg border p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
    </main>
  )
}
