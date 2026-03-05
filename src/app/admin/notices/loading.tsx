import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNoticesLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">공지사항 관리</h1>
          <p className="text-sm text-neutral-600">
            공지사항 목록을 확인하고 등록/수정합니다.
          </p>
        </div>
        <div className="inline-flex min-w-[92px] items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
          + 등록
        </div>
      </section>

      <div className="space-y-2">
        {["a", "b", "c", "d", "e", "f"].map((key) => (
          <div key={key} className="space-y-2 rounded-md border p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </main>
  )
}
