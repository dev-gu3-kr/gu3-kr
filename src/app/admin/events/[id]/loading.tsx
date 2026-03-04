import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEventDetailLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm text-neutral-500">← 목록으로</p>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-80" />
      </section>

      <section className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[92%]" />
      </section>

      <section className="flex items-center gap-2">
        <div className="rounded-md border px-3 py-2 text-sm">수정</div>
        <div className="rounded-md border px-3 py-2 text-sm">삭제</div>
      </section>
    </main>
  )
}
