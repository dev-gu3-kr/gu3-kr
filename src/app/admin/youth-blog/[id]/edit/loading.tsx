import { Skeleton } from "@/components/ui/skeleton"

export default function AdminYouthBlogEditLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <p className="text-sm text-neutral-500">← 상세로 돌아가기</p>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">공지사항 수정</h1>
          <p className="text-sm text-neutral-600">
            공지사항 정보를 수정합니다.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </section>
    </main>
  )
}
