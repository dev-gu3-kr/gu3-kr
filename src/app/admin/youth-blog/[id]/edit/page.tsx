import Link from "next/link"
import { notFound } from "next/navigation"
import { NoticeEditFormContainer } from "@/features/youth-blog/client"
import type { NoticeDetailDto } from "@/features/youth-blog/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminYouthBlogEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const response = await serverApiFetch
    .get(`/api/admin/youth-blog/${id}`)
    .send()

  if (response.status === 404) notFound()

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: NoticeDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) notFound()
  const post = json.item

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/admin/youth-blog/${id}`}
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 상세로 돌아가기
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        청소년 블로그 수정
      </h1>
      <p className="text-sm text-neutral-600">
        제목, 요약, 본문, 공개 여부를 수정합니다.
      </p>

      <NoticeEditFormContainer
        noticeId={post.id}
        initialTitle={post.title}
        initialSummary={post.summary}
        initialContent={post.content}
        initialIsPublished={post.isPublished}
      />
    </main>
  )
}
