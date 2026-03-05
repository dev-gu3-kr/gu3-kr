import { AppLink as Link } from "@/components/AppLink"
import { NoticeEditFormContainer } from "@/features/notices/client"

export default async function AdminNoticeEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  return (
    <main className="space-y-4">
      <Link
        href={`/admin/notices/${id}`}
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        ← 상세로 돌아가기
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        공지사항 수정
      </h1>
      <p className="text-sm text-neutral-600">
        공지 제목, 요약, 본문, 공개 여부를 수정합니다.
      </p>
      <NoticeEditFormContainer noticeId={id} />
    </main>
  )
}
