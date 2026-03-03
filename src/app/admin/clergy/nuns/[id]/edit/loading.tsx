import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNunEditLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <p className="text-sm text-neutral-500">← 상세로 돌아가기</p>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 수정</h1>
          <p className="text-sm text-neutral-600">
            수녀님 소개 정보를 수정합니다.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-[260px] w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </section>
    </main>
  )
}
