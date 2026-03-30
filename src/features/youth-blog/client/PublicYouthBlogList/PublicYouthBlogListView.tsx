import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import Image from "next/image"
import { AppLink as Link } from "@/components/AppLink"
import type { YouthBlogListItemDto } from "@/features/youth-blog/isomorphic"
import { cn } from "@/lib/utils"

type PublicYouthBlogListViewProps = {
  items: YouthBlogListItemDto[]
  currentPage: number
  totalPages: number
  pageNumbers: number[]
  query: string
}

function buildPageHref(pageNo: number, query: string) {
  return query
    ? `/youth/blog?page=${pageNo}&q=${encodeURIComponent(query)}`
    : `/youth/blog?page=${pageNo}`
}

function buildDetailHref(id: string) {
  return `/youth/blog/${id}`
}

function getContentPreview(content: string) {
  return content
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "")
    .replace(/[>*_~|]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function PublicYouthBlogListView({
  items,
  currentPage,
  totalPages,
  pageNumbers,
  query,
}: PublicYouthBlogListViewProps) {
  const prevHref =
    currentPage > 1 ? buildPageHref(currentPage - 1, query) : null
  const nextHref =
    currentPage < totalPages ? buildPageHref(currentPage + 1, query) : null

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        청소년 블로그
      </h2>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#ececec] py-16 text-center text-sm text-[#777]">
          등록된 청소년 블로그가 없습니다.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {items.map((item, index) => {
            const preview = getContentPreview(item.content)

            return (
              <Link
                key={item.id}
                href={buildDetailHref(item.id)}
                className={cn(
                  "block",
                  index === 0 && "md:col-span-2 lg:col-span-1",
                )}
              >
                <article className="overflow-hidden rounded-md border border-[#e5e7eb] bg-white transition-colors hover:bg-neutral-50">
                  <div className="p-4 pb-3">
                    <p className="line-clamp-2 text-base font-medium text-[#252629]">
                      {item.title}
                    </p>
                  </div>

                  <div className="relative aspect-video bg-[#f3f4f6]">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        sizes={
                          index === 0
                            ? "(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 100vw"
                            : "(min-width: 768px) 50vw, 100vw"
                        }
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                        썸네일 없음
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 p-4 pt-3">
                    <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#5f6672]">
                      {preview || "본문 미리보기가 없습니다."}
                    </p>
                    <p className="text-xs text-[#7f8590]">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}

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
          action="/youth/blog"
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
            aria-label="청소년 블로그 검색"
            className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[#252629] md:right-3 md:text-[#8d8d8d]"
          >
            <Search className="h-7 w-7 md:h-4 md:w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
