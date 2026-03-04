import Link from "next/link"
import { notFound } from "next/navigation"
import { BulletinEditFormContainer } from "@/features/bulletins/client"
import { serverApiFetch } from "@/lib/api-server"

type BulletinDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  attachments: Array<{
    id: string
    originalName: string
    url: string
  }>
}

// 본당주보 수정 페이지: 기존 데이터를 불러와 수정 폼에 주입한다.
export default async function AdminBulletinEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const response = await serverApiFetch.get(`/api/admin/bulletins/${id}`).send()
  if (response.status === 404) {
    notFound()
  }

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: BulletinDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) {
    notFound()
  }

  const item = json.item
  const attachment = item.attachments[0]

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
        <BulletinEditFormContainer
          bulletinId={item.id}
          initialTitle={item.title}
          initialContent={item.content}
          initialIsPublished={item.isPublished}
          currentFileName={attachment?.originalName}
          currentFileUrl={
            attachment ? `/api/admin/bulletins/${id}/download` : undefined
          }
        />
      </section>
    </main>
  )
}
