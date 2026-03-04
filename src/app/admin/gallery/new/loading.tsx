import { Skeleton } from "@/components/ui/skeleton"

export default function AdminGalleryNewLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">갤러리 등록</h1>
          <p className="text-sm text-neutral-600">
            새 갤러리 게시글을 등록합니다.
          </p>
        </div>
      </section>
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
