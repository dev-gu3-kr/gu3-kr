import Link from "next/link"
import { PriestListContainer } from "@/features/clergy-priests/client"

export default function AdminPriestsPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">신부님 소개 관리</h1>
          <p className="text-sm text-neutral-600">
            신부님 소개 목록을 확인하고 등록/수정합니다.
          </p>
        </div>
        <Link
          href="/admin/clergy/priests/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </section>
      <PriestListContainer />
    </main>
  )
}
