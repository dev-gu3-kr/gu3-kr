import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import Image from "next/image"

import { AppLink as Link } from "@/components/AppLink"
import { GalleryYoutubeBadge } from "@/components/GalleryYoutubeBadge"
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

function buildDetailHref(id: string) {
  return `/notice/gallery/${id}`
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
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        본당 갤러리
      </h2>

      <div className="mt-7 md:hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#777]">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8">
            {items.map((item) => (
              <Link
                key={item.id}
                href={buildDetailHref(item.id)}
                className="block"
              >
                <article>
                  <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#9a9a9a]">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[16px] font-semibold text-white">
                        IMG
                      </div>
                    )}

                    {item.hasYoutube ? (
                      <GalleryYoutubeBadge className="absolute bottom-2 right-2" />
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="line-clamp-1 text-[16px] font-semibold tracking-[-0.02em] text-[#252629]">
                      {item.title}
                    </p>
                    <p className="text-[13px] font-medium text-[#7f8590]">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 hidden grid-cols-1 gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {items.length === 0 ? (
          <div className="col-span-full py-16 text-center text-sm text-[#777]">
            등록된 갤러리가 없습니다.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={buildDetailHref(item.id)}
              className="block"
            >
              <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]">
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
                    <GalleryYoutubeBadge className="absolute bottom-2 right-2" />
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
            </Link>
          ))
        )}
      </div>

      <div className="mt-10 space-y-6 md:relative md:mt-8 md:h-10 md:space-y-0">
        <div className="border-t border-[#ececec] md:hidden" />

        <div className="flex items-center justify-center gap-4 md:gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex size-[56px] items-center justify-center rounded-full text-[#252629] transition-colors hover:bg-[#f5f5f5] md:h-7 md:w-7 md:bg-[#f5f5f5] md:text-[#888] md:hover:bg-[#ececec]"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-7 w-7 md:h-5 md:w-5" />
            </Link>
          ) : (
            <span className="inline-flex size-[56px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0] md:h-7 md:w-7">
              <ChevronLeft className="h-7 w-7 md:h-5 md:w-5" />
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
                    ? "inline-flex h-8 min-w-8 items-center justify-center px-1 text-[18px] font-semibold text-[#bd2125] md:h-7 md:w-7 md:px-0 md:text-sm md:text-[#8b1e1e]"
                    : "inline-flex h-8 min-w-8 items-center justify-center px-1 text-[18px] font-medium text-[#7f8590] hover:text-[#222] md:h-7 md:w-7 md:px-0 md:text-sm md:text-[#666]"
                }
              >
                {pageNo}
              </Link>
            )
          })}

          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex size-[56px] items-center justify-center text-[#252629] transition-colors hover:bg-[#f5f5f5] md:h-7 md:w-7 md:rounded-full md:bg-[#f5f5f5] md:text-[#888] md:hover:bg-[#ececec]"
              aria-label="다음 페이지"
            >
              <ChevronRight className="h-7 w-7 md:h-5 md:w-5" />
            </Link>
          ) : (
            <span className="inline-flex size-[56px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0] md:h-7 md:w-7">
              <ChevronRight className="h-7 w-7 md:h-5 md:w-5" />
            </span>
          )}
        </div>

        <form
          action="/notice/gallery"
          className="relative mx-auto w-full md:absolute md:right-0 md:top-0 md:mx-0 md:max-w-[260px]"
        >
          <input type="hidden" name="page" value="1" />
          <input
            name="q"
            defaultValue={query}
            placeholder="검색어 입력시"
            className="h-[68px] w-full rounded-[12px] bg-[#f5f6f8] px-5 pr-14 text-[16px] text-[#444] outline-none placeholder:text-[#6d6f74] md:h-9 md:rounded md:bg-[#efefef] md:px-3 md:pr-9 md:text-sm"
          />
          <button
            type="submit"
            aria-label="갤러리 검색"
            className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[#252629] md:right-3 md:text-[#8d8d8d]"
          >
            <Search className="h-7 w-7 md:h-4 md:w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
