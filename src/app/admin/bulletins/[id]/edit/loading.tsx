import { Skeleton } from "@/components/ui/skeleton"

export default function AdminBulletinEditLoading() {
  return (
    <main className="space-y-4">
      <p className="text-sm text-neutral-500">← 상세로 돌아가기</p>

      <h1 className="text-2xl font-semibold">본당주보 수정</h1>
      <p className="text-sm text-neutral-600">
        제목, 주보파일, 내용을 수정합니다.
      </p>

      <section className="rounded-md border p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-28" />
        </div>
      </section>
    </main>
  )
}
