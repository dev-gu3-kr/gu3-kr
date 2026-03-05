import { AppLink as Link } from "@/components/AppLink"
import { BulletinEditFormContainer } from "@/features/bulletins/client"

export default async function AdminBulletinEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-4">
      <Link
        href={`/admin/bulletins/${id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← 상세로 돌아가기
      </Link>
      <h1 className="text-2xl font-semibold">본당주보 수정</h1>
      <p className="text-sm text-neutral-600">
        제목, 주보파일, 내용을 수정합니다.
      </p>
      <section className="rounded-md border p-4">
        <BulletinEditFormContainer bulletinId={id} />
      </section>
    </main>
  )
}
