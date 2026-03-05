import Link from "next/link"
import { PriestFormContainer } from "@/features/clergy-priests/client"

export default async function AdminPriestEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <Link
          href={`/admin/clergy/priests/${id}`}
          className="inline-flex text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">신부님 수정</h1>
          <p className="text-sm text-neutral-600">
            신부님 소개 정보를 수정합니다.
          </p>
        </div>
        <section className="pt-1">
          <PriestFormContainer mode="edit" priestId={id} />
        </section>
      </section>
    </main>
  )
}
