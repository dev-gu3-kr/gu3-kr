import Link from "next/link"
import { GalleryEditFormContainer } from "@/features/gallery/client"

export default async function AdminGalleryEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
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
        <GalleryEditFormContainer postId={id} />
      </section>
    </main>
  )
}
