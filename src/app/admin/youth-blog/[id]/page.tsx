"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { useParams } from "next/navigation"

import { AppLink as Link } from "@/components/AppLink"
import {
  YouthBlogContentViewer,
  YouthBlogDeleteButton,
} from "@/features/youth-blog/client"
import { useYouthBlogDetailQuery } from "@/features/youth-blog/isomorphic"

export default function AdminYouthBlogViewPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data: post, isLoading, isError } = useYouthBlogDetailQuery(id)

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
          <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-10 w-2/3 animate-pulse rounded bg-neutral-200" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-neutral-200" />
        <div className="space-y-2 py-2">
          <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </main>
    )
  }

  if (isError || !post) {
    return (
      <main className="space-y-6">
        <p className="text-sm text-red-600">
          청소년 블로그 상세를 불러오지 못했습니다.
        </p>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/youth-blog"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>
        <p className="text-xs text-neutral-500">
          관리자 ·{" "}
          {formatDistanceToNow(new Date(post.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>

      {post.summary ? <p className="text-base text-neutral-700">{post.summary}</p> : null}

      <article className="toastui-editor-contents text-[15px] leading-7 text-neutral-900">
        <YouthBlogContentViewer content={post.content} />
      </article>

      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Link
          href={`/admin/youth-blog/${post.id}/edit`}
          className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          수정
        </Link>
        <YouthBlogDeleteButton noticeId={post.id} />
      </div>
    </main>
  )
}
