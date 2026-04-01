import { AppLink as Link } from "@/components/AppLink"
import { IntroPostFormContainer } from "@/features/intro-posts/client"

export default function AdminYouthAboutNewPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">청소년 마당 소개 작성</h1>
          <p className="text-sm text-neutral-600">
            이미지, 제목, 내용을 순서대로 보여줄 소개 카드를 등록합니다.
          </p>
        </div>

        <Link
          href="/admin/youth/about"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </section>

      <section className="rounded-lg border p-4">
        <IntroPostFormContainer section="youth" />
      </section>
    </main>
  )
}
