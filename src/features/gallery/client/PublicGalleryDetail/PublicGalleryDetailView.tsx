import { ChevronLeft, ChevronRight } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import { GalleryContentViewer } from "@/features/gallery/client"
import type {
  GalleryDetailDto,
  GalleryNavigationDto,
} from "@/features/gallery/isomorphic"

type PublicGalleryDetailViewProps = {
  detail: GalleryDetailDto
  navigation: GalleryNavigationDto
}

export function PublicGalleryDetailView({
  detail,
  navigation,
}: PublicGalleryDetailViewProps) {
  const createdAtLabel = new Date(detail.createdAt).toLocaleDateString("ko-KR")

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="hidden text-[30px] font-semibold tracking-[-0.02em] text-[#252629] md:block">
        본당 갤러리
      </h2>

      <div className="md:hidden">
        <h3 className="break-keep text-[28px] font-semibold leading-[1.45] tracking-[-0.03em] text-[#2f2f2f]">
          {detail.title}
        </h3>

        <p className="mt-4 text-[15px] font-medium text-[#7f8590]">
          {createdAtLabel}
        </p>
      </div>

      <div className="mt-4 hidden rounded-md bg-[#efefef] px-4 py-4 md:block">
        <div className="flex items-center gap-4">
          <p className="min-w-0 flex-1 break-keep text-[15px] font-medium leading-8 text-[#2f2f2f]">
            {detail.title}
          </p>

          <p className="shrink-0 whitespace-nowrap text-right text-xs text-[#666]">
            {createdAtLabel}
          </p>
        </div>
      </div>

      <article className="mt-8 border-b border-[#e5e5e5] px-2 py-6 text-[15px] leading-7 text-[#2f2f2f] [&_.toastui-editor-contents]:text-[16px] [&_.toastui-editor-contents]:leading-8">
        <GalleryContentViewer content={detail.content} />
      </article>

      <div className="relative mt-5 flex items-center justify-between gap-3 text-sm text-[#444] md:min-h-9 md:block">
        <Link
          href="/notice/gallery"
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
              href={`/notice/gallery/${navigation.prev.id}`}
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
              href={`/notice/gallery/${navigation.next.id}`}
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
