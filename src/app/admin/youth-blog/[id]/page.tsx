"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  NoticeContentViewer,
  NoticeDeleteButton,
} from "@/features/youth-blog/client"
import { useYouthBlogDetailQuery } from "@/features/youth-blog/isomorphic"

export default function AdminYouthBlogViewPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data: post, isLoading, isError } = useYouthBlogDetailQuery(id)

  if (isLoading) {
    return (
      <main className="space-y-6">
        <section className="rounded-lg border bg-white p-4">
          불러오는 중...
        </section>
      </main>
    )
  }

  if (isError || !post) {
    return (
      <main className="space-y-6">
        <section className="rounded-lg border bg-white p-4 text-sm text-red-600">
          청소년 블로그 상세를 불러오지 못했습니다.
        </section>
      </main>
    )
  }

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
