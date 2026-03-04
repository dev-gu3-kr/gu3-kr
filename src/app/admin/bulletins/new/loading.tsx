import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBulletinNewLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">본당주보 등록</h1>
          <p className="text-sm text-neutral-600">새 본당주보를 등록합니다.</p>
        </div>

        <div className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium">
          목록으로
        </div>
      </section>

      <section className="rounded-lg border p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
    </main>
  )
}
