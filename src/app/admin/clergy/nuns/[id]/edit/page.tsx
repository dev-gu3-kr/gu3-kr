import Link from "next/link"
import { NunFormContainer } from "@/features/clergy-nuns/client"

export default async function AdminNunEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <Link
          href={`/admin/clergy/nuns/${id}`}
          className="inline-flex text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">수녀님 수정</h1>
          <p className="text-sm text-neutral-600">
            수녀님 소개 정보를 수정합니다.
          </p>
        </div>
        <section className="pt-1">
          <NunFormContainer mode="edit" nunId={id} />
        </section>
      </section>
    </main>
  )
}
