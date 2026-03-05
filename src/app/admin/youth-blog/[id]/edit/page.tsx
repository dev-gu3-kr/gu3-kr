import { AppLink as Link } from "@/components/AppLink"
import { YouthBlogEditFormContainer } from "@/features/youth-blog/client"

export default async function AdminYouthBlogEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-4">
      <Link
        href={`/admin/youth-blog/${id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← 상세로 돌아가기
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        청소년 블로그 수정
      </h1>
      <p className="text-sm text-neutral-600">
        제목, 요약, 본문, 공개 여부를 수정합니다.
      </p>
      <YouthBlogEditFormContainer noticeId={id} />
    </main>
  )
}
