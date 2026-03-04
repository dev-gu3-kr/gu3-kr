import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEventEditLoading() {
  return (
    <main className="space-y-4">
      <p className="text-sm text-neutral-500">← 상세로 돌아가기</p>
      <h1 className="text-2xl font-semibold">일정 수정</h1>
      <p className="text-sm text-neutral-600">제목, 내용, 기간을 수정합니다.</p>

      <section className="rounded-md border p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
    </main>
  )
}
