import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPastoralCouncilDetailLoading() {
  return (
    <main className="space-y-6">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-80 w-64" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-28 w-full" />
    </main>
  )
}
