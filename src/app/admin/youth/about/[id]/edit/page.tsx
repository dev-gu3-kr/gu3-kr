import { AppLink as Link } from "@/components/AppLink"
import {
  IntroPostDeleteButton,
  IntroPostFormContainer,
} from "@/features/intro-posts/client"

export default async function AdminYouthAboutEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/admin/youth/about"
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            ← 목록으로 돌아가기
          </Link>
          <h1 className="text-2xl font-semibold">청소년 마당 소개 수정</h1>
          <p className="text-sm text-neutral-600">
            카드 미리보기와 실제 공개 화면이 같은 구조로 유지되도록 수정합니다.
          </p>
        </div>

        <IntroPostDeleteButton section="youth" postId={id} />
      </section>

      <section className="rounded-lg border p-4">
        <IntroPostFormContainer section="youth" postId={id} />
      </section>
    </main>
  )
}
