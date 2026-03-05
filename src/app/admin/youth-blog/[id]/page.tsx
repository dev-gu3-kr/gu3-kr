import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  NoticeContentViewer,
  NoticeDeleteButton,
} from "@/features/youth-blog/client"
import type { YouthBlogDetailDto } from "@/features/youth-blog/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminYouthBlogViewPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const response = await serverApiFetch
    .get(`/api/admin/youth-blog/${id}`)
    .send()
  if (response.status === 404) notFound()

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: YouthBlogDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) notFound()

  const post = json.item

  return (
    <main className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/youth-blog"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로
          </Link>
          <p className="text-xs text-neutral-500">
            관리자 ·{" "}
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>

        {post.summary ? (
          <p className="text-base text-neutral-700">{post.summary}</p>
        ) : null}

        <article className="toastui-editor-contents text-[15px] leading-7 text-neutral-900">
          <NoticeContentViewer content={post.content} />
        </article>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Link
            href={`/admin/youth-blog/${post.id}/edit`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            수정
          </Link>
          <NoticeDeleteButton noticeId={post.id} />
        </div>
      </section>
    </main>
  )
}
