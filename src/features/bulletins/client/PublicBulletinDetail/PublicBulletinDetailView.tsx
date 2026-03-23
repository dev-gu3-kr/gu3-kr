import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { AppLink as Link } from "@/components/AppLink"
import type {
  BulletinNavigationDto,
  BulletinPublicDetailDto,
} from "@/features/bulletins/isomorphic"

type PublicBulletinDetailViewProps = {
  detail: BulletinPublicDetailDto
  navigation: BulletinNavigationDto
}

export function PublicBulletinDetailView({
  detail,
  navigation,
}: PublicBulletinDetailViewProps) {
  const attachment = detail.attachments[0]

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="hidden text-[30px] font-semibold tracking-[-0.02em] text-[#252629] md:block">
        본당 주보
      </h2>

      <div className="md:hidden">
        <h3 className="break-keep text-[28px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#2f2f2f]">
          {detail.title}
        </h3>

        {attachment ? (
          <a
            href={`/api/bulletins/${detail.id}/download`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#8b1e1e] hover:underline"
          >
            <Download className="h-4 w-4" />
            {attachment.originalName}
          </a>
        ) : null}

        <p className="mt-4 text-sm text-[#666]">
          {detail.authorName} <span className="mx-1 text-[#b8b8b8]">·</span>
          {new Date(detail.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      <div className="mt-4 hidden rounded-md bg-[#efefef] px-4 py-4 md:block">
        <div className="flex items-start gap-6">
          <div className="min-w-0 flex-1">
            <p className="break-keep text-[15px] font-medium leading-8 text-[#2f2f2f]">
              {detail.title}
            </p>

            {attachment ? (
              <a
                href={`/api/bulletins/${detail.id}/download`}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#8b1e1e] hover:underline"
              >
                <Download className="h-4 w-4" />
                {attachment.originalName}
              </a>
            ) : null}
          </div>

          <p className="shrink-0 whitespace-nowrap text-right text-xs text-[#666]">
            {detail.authorName} <span className="mx-1 text-[#b8b8b8]">·</span>
            {new Date(detail.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      <article className="border-b border-[#e5e5e5] px-2 py-6 text-[15px] leading-7 text-[#2f2f2f]">
        {detail.content.trim() ? (
          <p className="whitespace-pre-wrap">{detail.content}</p>
        ) : (
          <p className="text-sm text-neutral-500">등록된 안내가 없습니다.</p>
        )}
      </article>

      <div className="relative mt-5 flex items-center justify-between gap-3 text-sm text-[#444] md:min-h-9 md:block">
        <Link
          href="/notice/weekly-bulletin"
          className="inline-flex items-center gap-2 text-[#333] hover:text-[#111]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d9d9d9] text-[#666]">
            <ChevronLeft className="h-4 w-4" />
          </span>
          목록으로
        </Link>

        <div className="ml-auto flex items-center justify-end gap-4 text-[#777] md:absolute md:left-1/2 md:top-1/2 md:ml-0 md:-translate-x-1/2 md:-translate-y-1/2">
          {navigation.prev ? (
            <Link
              href={`/notice/weekly-bulletin/${navigation.prev.id}`}
              className="inline-flex items-center gap-2 text-[#666] hover:text-[#333]"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#888]">
                <ChevronLeft className="h-4 w-4" />
              </span>
              이전 글
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#c1c1c1]">
                <ChevronLeft className="h-4 w-4" />
              </span>
              이전 글
            </button>
          )}

          <span className="h-4 w-px bg-[#d9d9d9]" aria-hidden />

          {navigation.next ? (
            <Link
              href={`/notice/weekly-bulletin/${navigation.next.id}`}
              className="inline-flex items-center gap-2 text-[#666] hover:text-[#333]"
            >
              다음 글
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#888]">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2"
            >
              다음 글
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f3f3] text-[#c1c1c1]">
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
