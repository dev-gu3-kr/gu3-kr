import Link from "next/link"
import { notFound } from "next/navigation"
import { GalleryEditFormContainer } from "@/features/gallery/client"
import { serverApiFetch } from "@/lib/api-server"

type GalleryDetailDto = {
  id: string
  title: string
  content: string
  isPublished: boolean
  galleryImages: Array<{ id: string; originalName: string; url: string }>
}

export default async function AdminGalleryEditPage(props: {
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
    <main className="space-y-4">
      <Link
        href={`/admin/gallery/${id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← 상세로 돌아가기
      </Link>
      <h1 className="text-2xl font-semibold">갤러리 수정</h1>
      <p className="text-sm text-neutral-600">제목/썸네일/내용을 수정합니다.</p>

      <section className="rounded-md border p-4">
        <GalleryEditFormContainer
          postId={item.id}
          initialTitle={item.title}
          initialContent={item.content}
          initialIsPublished={item.isPublished}
          currentThumbnailUrl={thumb?.url}
        />
      </section>
    </main>
  )
}
