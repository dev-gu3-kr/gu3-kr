"use client"

import { useParams } from "next/navigation"
import { AppLink as Link } from "@/components/AppLink"
import { BulletinDeleteButton } from "@/features/bulletins/client"
import { useBulletinDetailQuery } from "@/features/bulletins/isomorphic"

export default function AdminBulletinDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const { data: item, isLoading, isError } = useBulletinDetailQuery(id)

  if (isLoading)
    return (
      <main className="space-y-6">
        <section className="space-y-2">
          <Link
            href="/admin/bulletins"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로
          </Link>
          <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-44 animate-pulse rounded bg-neutral-200" />
        </section>
        <section className="space-y-3">
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-neutral-200" />
        </section>
        <section className="space-y-2">
          <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
          </div>
        </section>
        <section className="flex items-center gap-2">
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
          <div className="h-9 w-16 animate-pulse rounded-md bg-neutral-200" />
        </section>
      </main>
    )
  if (isError || !item)
    return (
      <main className="space-y-6">
        <section className="rounded-md border p-4 text-sm text-red-600">
          주보 상세를 불러오지 못했습니다.
        </section>
      </main>
    )

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
