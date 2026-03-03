import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNunsLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 소개 관리</h1>
          <p className="text-sm text-neutral-600">
            수녀님 소개 목록을 확인하고 등록/수정합니다.
          </p>
        </div>
        <div className="inline-flex min-w-[92px] items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
          + 등록
        </div>
      </section>

      <div className="space-y-2">
        {["a", "b", "c", "d", "e"].map((key) => (
          <div
            key={key}
            className="grid grid-cols-[104px_1fr] gap-4 rounded-md border p-3"
          >
            <Skeleton className="h-[128px] w-[104px]" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
