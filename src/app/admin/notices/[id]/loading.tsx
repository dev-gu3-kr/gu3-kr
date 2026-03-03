import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNoticeViewLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">← 목록으로</p>
          <Skeleton className="h-4 w-24" />
        </div>

        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-full" />

        <div className="space-y-2 py-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[88%]" />
          <Skeleton className="h-40 w-full" />
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <div className="rounded-md border px-3 py-2 text-sm">수정</div>
          <div className="rounded-md border px-3 py-2 text-sm">삭제</div>
        </div>
      </section>
    </main>
  )
}
