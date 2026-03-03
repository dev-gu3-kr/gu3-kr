import Link from "next/link"
import { notFound } from "next/navigation"
import { NoticeEditFormContainer } from "@/features/notices/client"
import type { NoticeDetailDto } from "@/features/notices/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminNoticeEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  // API 계층을 통해 수정 대상 공지를 조회한다.
  const response = await serverApiFetch.get(`/api/admin/notices/${id}`).send()

  if (response.status === 404) {
    notFound()
  }

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: NoticeDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) {
    notFound()
  }

  const notice = json.item

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/notices/${id}`}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        공지사항 수정
      </h1>
      <p className="text-sm text-neutral-600">
        공지 제목, 요약, 본문, 공개 여부를 수정합니다.
      </p>

      <NoticeEditFormContainer
        noticeId={notice.id}
        initialTitle={notice.title}
        initialSummary={notice.summary}
        initialContent={notice.content}
        initialIsPublished={notice.isPublished}
      />
    </main>
  )
}
