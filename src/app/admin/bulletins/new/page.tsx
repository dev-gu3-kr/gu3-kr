import Link from "next/link"
import { BulletinWriteFormContainer } from "@/features/bulletins/client"

// 본당주보 등록 페이지: 제목/파일/내용 입력 폼을 제공한다.
export default function AdminBulletinNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">본당주보 등록</h1>
          <p className="text-sm text-neutral-600">새 본당주보를 등록합니다.</p>
        </div>

        <Link
          href="/admin/bulletins"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <BulletinWriteFormContainer />
      </section>
    </main>
  )
}
