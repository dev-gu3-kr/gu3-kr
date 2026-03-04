import { Skeleton } from "@/components/ui/skeleton"

export default function AdminGalleryDetailLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm text-neutral-500">← 목록으로</p>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-44" />
      </section>
      <Skeleton className="h-56 w-full max-w-md" />
      <Skeleton className="h-28 w-full" />
    </main>
  )
}
