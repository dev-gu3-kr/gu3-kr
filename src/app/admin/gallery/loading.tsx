import { Skeleton } from "@/components/ui/skeleton"

export default function AdminGalleryLoading() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">갤러리 관리</h1>
          <p className="text-sm text-neutral-600">
            카드형 목록으로 갤러리를 관리합니다.
          </p>
        </div>
        <div className="h-9 w-20 rounded-md bg-black" />
      </section>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((k) => (
          <Skeleton key={k} className="h-64 w-full" />
        ))}
      </div>
    </main>
  )
}
