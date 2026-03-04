import { Skeleton } from "@/components/ui/skeleton"

export default function AdminGalleryEditLoading() {
  return (
    <main className="space-y-4">
      <p className="text-sm text-neutral-500">← 상세로 돌아가기</p>
      <h1 className="text-2xl font-semibold">갤러리 수정</h1>
      <section className="rounded-md border p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
    </main>
  )
}
