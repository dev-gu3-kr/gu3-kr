import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import Image from "next/image"

import { AppLink as Link } from "@/components/AppLink"
import type { GalleryListItemDto } from "@/features/gallery/isomorphic"

type PublicGalleryListViewProps = {
  items: GalleryListItemDto[]
  currentPage: number
  totalPages: number
  pageNumbers: number[]
  query: string
}

function buildPageHref(pageNo: number, query: string) {
  return query
    ? `/notice/gallery?page=${pageNo}&q=${encodeURIComponent(query)}`
    : `/notice/gallery?page=${pageNo}`
}

export function PublicGalleryListView({
  items,
  currentPage,
  totalPages,
  pageNumbers,
  query,
}: PublicGalleryListViewProps) {
  const prevHref =
    currentPage > 1 ? buildPageHref(currentPage - 1, query) : null
  const nextHref =
    currentPage < totalPages ? buildPageHref(currentPage + 1, query) : null

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        본당 갤러리
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#777]">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
            >
              <div className="relative aspect-[16/9] bg-[#9a9a9a]">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-white/80">
                    IMG
                  </div>
                )}

                {item.hasYoutube ? (
                  <span className="pointer-events-none absolute bottom-2 right-2">
                    <Image
                      src="/images/icons/gallery-youtube-badge.svg"
                      alt="유튜브 링크 포함"
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  </span>
                ) : null}
              </div>

              <div className="space-y-1 px-3 py-3">
                <p className="line-clamp-1 text-sm font-medium text-[#252629]">
                  {item.title}
                </p>
                <p className="text-xs text-[#707070]">
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8 space-y-3 md:relative md:h-10 md:space-y-0">
        <div className="flex items-center justify-center gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#888] hover:bg-[#ececec]"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0]">
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {pageNumbers.map((pageNo) => {
            const isActive = pageNo === currentPage
            return (
              <Link
                key={pageNo}
                href={buildPageHref(pageNo, query)}
                className={
                  isActive
                    ? "inline-flex h-7 w-7 items-center justify-center text-sm font-semibold text-[#8b1e1e]"
                    : "inline-flex h-7 w-7 items-center justify-center text-sm text-[#666] hover:text-[#222]"
                }
              >
                {pageNo}
              </Link>
            )
          })}

          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#888] hover:bg-[#ececec]"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0]">
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </div>

        <form
          action="/notice/gallery"
          className="relative mx-auto w-full max-w-[260px] md:absolute md:right-0 md:top-0 md:mx-0"
        >
          <input type="hidden" name="page" value="1" />
          <input
            name="q"
            defaultValue={query}
            placeholder="검색어 입력시"
            className="h-9 w-full rounded bg-[#efefef] px-3 pr-9 text-sm text-[#444] outline-none"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d8d8d]" />
        </form>
      </div>
    </section>
  )
}
