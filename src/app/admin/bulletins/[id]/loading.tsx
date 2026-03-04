import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBulletinViewLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm text-neutral-500">← 목록으로</p>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-56" />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">주보 파일</h2>
        <Skeleton className="h-5 w-64" />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700">내용</h2>
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%]" />
          <Skeleton className="h-5 w-[88%]" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>

      <section className="flex items-center gap-2">
        <div className="rounded-md border px-3 py-2 text-sm">수정</div>
        <div className="rounded-md border px-3 py-2 text-sm">삭제</div>
      </section>
    </main>
  )
}
