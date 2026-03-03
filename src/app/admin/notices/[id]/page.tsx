import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  NoticeContentViewer,
  NoticeDeleteButton,
} from "@/features/notices/client"
import type { NoticeDetailDto } from "@/features/notices/isomorphic"
import { serverApiFetch } from "@/lib/api-server"

export default async function AdminNoticeViewPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  const response = await serverApiFetch.get(`/api/admin/notices/${id}`).send()
  if (response.status === 404) notFound()

  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: NoticeDetailDto
  } | null

  if (!response.ok || !json?.ok || !json.item) notFound()

  const notice = json.item

  return (
    <main className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/notices"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로
          </Link>
          <p className="text-xs text-neutral-500">
            관리자 ·{" "}
            {formatDistanceToNow(new Date(notice.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </p>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          {notice.title}
        </h1>

        {notice.summary ? (
          <p className="text-base text-neutral-700">{notice.summary}</p>
        ) : null}

        <article className="toastui-editor-contents text-[15px] leading-7 text-neutral-900">
          <NoticeContentViewer content={notice.content} />
        </article>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Link
            href={`/admin/notices/${notice.id}/edit`}
            className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            수정
          </Link>
          <NoticeDeleteButton noticeId={notice.id} />
        </div>
      </section>
    </main>
  )
}
