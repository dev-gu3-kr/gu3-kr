import Link from "next/link"
import { notFound } from "next/navigation"
import { BulletinDeleteButton } from "@/features/bulletins/client"
import { serverApiFetch } from "@/lib/api-server"

type BulletinDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  attachments: Array<{ id: string; originalName: string; url: string }>
}

// 본당주보 상세 페이지: 본문과 첨부 파일을 확인하고 수정/삭제 액션으로 이동한다.
export default async function AdminBulletinDetailPage(props: {
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
    <main className="space-y-6">
      <section className="space-y-2">
        <Link
          href="/admin/bulletins"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <p className="text-sm text-neutral-600">
          등록일 {item.createdAt.slice(0, 10)} ·{" "}
          {item.isPublished ? "공개" : "비공개"}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">주보 파일</h2>
        {attachment ? (
          <a
            href={`/api/admin/bulletins/${item.id}/download`}
            className="text-sm text-blue-600 hover:underline"
          >
            {attachment.originalName}
          </a>
        ) : (
          <p className="text-sm text-neutral-500">등록된 파일이 없습니다.</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700">내용</h2>
        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
          {item.content}
        </p>
      </section>

      <section className="flex items-center gap-2">
        <Link
          href={`/admin/bulletins/${item.id}/edit`}
          className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          수정
        </Link>
        <BulletinDeleteButton bulletinId={item.id} />
      </section>
    </main>
  )
}
