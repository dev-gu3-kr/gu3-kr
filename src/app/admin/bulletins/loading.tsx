import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBulletinsLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">본당주보 관리</h1>
          <p className="text-sm text-neutral-600">
            주보를 확인하고 바로 다운로드하거나 상세 화면으로 이동할 수
            있습니다.
          </p>
        </div>
        <div className="inline-flex min-w-[92px] items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-medium text-white">
          + 등록
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[180px]" />
          </div>
          <Skeleton className="h-9 w-full sm:max-w-sm" />
        </div>

        <div className="overflow-hidden rounded-md border">
          <ul className="divide-y">
            {["a", "b", "c", "d", "e"].map((key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-8 w-24" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
