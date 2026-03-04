import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  GalleryContentViewer,
  GalleryDeleteButton,
} from "@/features/gallery/client"
import { serverApiFetch } from "@/lib/api-server"

type GalleryDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  createdAt: string
  galleryImages: Array<{ id: string; originalName: string; url: string }>
}

export default async function AdminGalleryDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const response = await serverApiFetch.get(`/api/admin/gallery/${id}`).send()
  if (response.status === 404) notFound()
  const json = (await response.json().catch(() => null)) as {
    ok?: boolean
    item?: GalleryDetailDto
  } | null
  if (!response.ok || !json?.ok || !json.item) notFound()
  const item = json.item
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
          <GalleryContentViewer content={item.content} />
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
