import { AppLink as Link } from "@/components/AppLink"
import { BulletinListContainer } from "@/features/bulletins/client"

export default function AdminBulletinsPage() {
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
        <Link
          href="/admin/bulletins/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>

      <BulletinListContainer />
    </main>
  )
}
