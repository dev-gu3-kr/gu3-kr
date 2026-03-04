import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPastoralCouncilDetailLoading() {
  return (
    <main className="space-y-6">
      <section className="space-y-6 rounded-xl bg-white p-5">
        <p className="text-sm text-neutral-500">← 목록으로</p>

        <div className="mx-auto mt-2 flex w-full max-w-3xl flex-col items-center gap-5 sm:mt-0">
          <Skeleton className="h-[320px] w-[260px] rounded-xl" />
          <Skeleton className="h-10 w-64" />

          <div className="w-full max-w-xl">
            <div className="mx-auto grid w-fit gap-y-4">
              {["a", "b", "c"].map((key) => (
                <div
                  key={key}
                  className="grid grid-cols-[24px_88px_1fr] items-center gap-x-3"
                >
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-52" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <div className="rounded-md border px-3 py-2 text-sm">수정</div>
            <div className="rounded-md border px-3 py-2 text-sm">삭제</div>
          </div>
        </div>
      </section>
    </main>
  )
}
