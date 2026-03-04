import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPastoralCouncilEditLoading() {
  return (
    <main className="space-y-6">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-10 w-64" />
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
