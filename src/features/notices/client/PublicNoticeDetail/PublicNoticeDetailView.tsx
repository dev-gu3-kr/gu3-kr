import { ChevronLeft, ChevronRight } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import { Badge } from "@/components/ui/badge"
import { NoticeContentViewer } from "@/features/notices/client"
import type {
  NoticeDetailDto,
  NoticeNavigationDto,
} from "@/features/notices/isomorphic"

type PublicNoticeDetailViewProps = {
  detail: NoticeDetailDto
  navigation: NoticeNavigationDto
}

export function PublicNoticeDetailView({
  detail,
  navigation,
}: PublicNoticeDetailViewProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        공지사항
      </h2>

      {/* Mobile: card-like header (no border, gray background) */}
      <div className="mt-4 rounded-xl bg-[#efefef] px-4 py-4 md:hidden">
        <p className="break-keep text-[17px] font-medium leading-7 text-[#2f2f2f]">
          {detail.isPinned ? (
            <Badge
              variant="outline"
              className="mr-2 border-transparent bg-white px-3 py-[3px] text-[11px] font-semibold leading-none text-[#1f1f1f]"
            >
              공지
            </Badge>
          ) : null}
          {detail.title}
        </p>

        <p className="mt-3 text-xs text-[#666]">
          {detail.authorName} <span className="mx-1 text-[#b8b8b8]">·</span>
          {new Date(detail.createdAt).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* Desktop: existing row layout */}
      <div className="mt-4 hidden rounded-md bg-[#efefef] px-4 py-4 md:block">
        <div className="flex items-center gap-4">
          {detail.isPinned ? (
            <Badge
              variant="outline"
              className="shrink-0 border-transparent bg-white px-4 py-1.5 text-sm font-semibold text-[#1f1f1f]"
            >
              공지
            </Badge>
          ) : null}

          <p className="min-w-0 flex-1 break-keep text-[15px] font-medium leading-8 text-[#2f2f2f]">
            {detail.title}
          </p>

          <p className="shrink-0 whitespace-nowrap text-right text-xs text-[#666]">
            {detail.authorName} <span className="mx-1 text-[#b8b8b8]">·</span>
            {new Date(detail.createdAt).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      <article className="border-b border-[#e5e5e5] px-2 py-6 text-[15px] leading-7 text-[#2f2f2f] [&_.toastui-editor-contents]:text-[16px] [&_.toastui-editor-contents]:leading-8">
        <NoticeContentViewer content={detail.content} />
      </article>

      <div className="relative mt-5 flex items-center justify-between gap-3 text-sm text-[#444] md:min-h-9 md:block">
        <Link
          href="/notice/notices"
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
              href={`/notice/notices/${navigation.prev.id}`}
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
              href={`/notice/notices/${navigation.next.id}`}
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
