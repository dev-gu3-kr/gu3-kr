import { AppLink as Link } from "@/components/AppLink"
import { IntroPostListContainer } from "@/features/intro-posts/client"

export default function AdminYouthAboutPage() {
  return (
    <main className="space-y-6">
      <section className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">청소년 마당 소개 관리</h1>
          <p className="text-sm text-neutral-600">
            소개 카드 UI 그대로 미리보면서 등록된 청소년 마당 소개를 수정합니다.
          </p>
        </div>

        <Link
          href="/admin/youth/about/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 글쓰기
        </Link>
      </section>

      <IntroPostListContainer section="youth" />
    </main>
  )
}
