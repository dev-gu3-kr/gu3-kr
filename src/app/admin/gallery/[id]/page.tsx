"use client"

import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  GalleryContentViewer,
  GalleryDeleteButton,
} from "@/features/gallery/client"
import { useGalleryDetailQuery } from "@/features/gallery/isomorphic"

export default function AdminGalleryDetailPage() {
  const params = useParams<{ id: string }>()
  const id = String(params?.id ?? "")
  const {
    data: item,
    isLoading,
    isError,
    isFetching,
  } = useGalleryDetailQuery(id)

  if (isLoading)
    return (
      <main className="space-y-6">
        <section className="rounded-md border p-4">불러오는 중...</section>
      </main>
    )
  if (isError || !item)
    return (
      <main className="space-y-6">
        <section className="rounded-md border p-4 text-sm text-red-600">
          갤러리 상세를 불러오지 못했습니다.
        </section>
      </main>
    )

  const thumb = item.galleryImages[0]

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <Link
          href="/admin/gallery"
          className="text-sm text-neutral-500 hover:text-neutral-800"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-semibold">{item.title}</h1>
        <p className="text-sm text-neutral-600">
          {item.isPublished ? "공개" : "비공개"} ·{" "}
          {formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700">썸네일</h2>
        {thumb ? (
          <Image
            src={thumb.url}
            alt={thumb.originalName}
            width={960}
            height={540}
            className="h-56 w-full max-w-md rounded-md border object-cover"
          />
        ) : (
          <p className="text-sm text-neutral-500">등록된 썸네일이 없습니다.</p>
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-neutral-700">내용</h2>
        <article className="toastui-editor-contents text-[15px] leading-7 text-neutral-900">
          {item.content ? (
            <GalleryContentViewer content={item.content} />
          ) : isFetching ? (
            <p className="text-sm text-neutral-500">본문 불러오는 중...</p>
          ) : (
            <p className="text-sm text-neutral-500">본문이 없습니다.</p>
          )}
        </article>
      </section>
      <section className="flex items-center gap-2">
        <Link
          href={`/admin/gallery/${item.id}/edit`}
          className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          수정
        </Link>
        <GalleryDeleteButton postId={item.id} />
      </section>
    </main>
  )
}
