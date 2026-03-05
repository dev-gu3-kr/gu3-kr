import { AppLink as Link } from "@/components/AppLink"
import { PastoralCouncilFormContainer } from "@/features/pastoral-council/client"

export default async function AdminPastoralCouncilEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-6">
      <section className="space-y-4 rounded-xl bg-white p-5">
        <Link
          href={`/admin/pastoral-council/${id}`}
          className="inline-flex text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">사목협의회 위원 수정</h1>
          <p className="text-sm text-neutral-600">
            사목협의회 위원 정보를 수정합니다.
          </p>
        </div>
        <section className="pt-1">
          <PastoralCouncilFormContainer mode="edit" memberId={id} />
        </section>
      </section>
    </main>
  )
}
