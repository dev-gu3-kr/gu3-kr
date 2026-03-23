import { ChevronLeft, ChevronRight, Search } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import type { NoticeListItemDto } from "@/features/notices/isomorphic"

type PublicNoticeListViewProps = {
  items: NoticeListItemDto[]
  totalCount: number
  currentPage: number
  totalPages: number
  query: string
  pageNumbers: number[]
}

function buildPageHref(pageNo: number, query: string) {
  return query
    ? `/notice/notices?page=${pageNo}&q=${encodeURIComponent(query)}`
    : `/notice/notices?page=${pageNo}`
}

export function PublicNoticeListView({
  items,
  totalCount,
  currentPage,
  totalPages,
  query,
  pageNumbers,
}: PublicNoticeListViewProps) {
  const prevHref =
    currentPage > 1 ? buildPageHref(currentPage - 1, query) : null
  const nextHref =
    currentPage < totalPages ? buildPageHref(currentPage + 1, query) : null

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        공지사항
      </h2>

      <div className="mt-8 md:hidden">
        {items.length === 0 ? (
          <div className="border-y border-[#ececec] py-10 text-center text-sm text-neutral-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <div>
            {items.map((item, index) => {
              const rowNo = totalCount - (currentPage - 1) * 10 - index

              return (
                <article
                  key={item.id}
                  className="border-b border-[#ececec] text-[#252629]"
                >
                  <Link
                    href={`/notice/notices/${item.id}`}
                    className="flex min-w-0 items-center gap-4 py-6"
                  >
                    {item.isPinned ? (
                      <span className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-[10px] bg-[#f3f4f6] px-3 text-[16px] font-semibold tracking-[-0.02em]">
                        공지
                      </span>
                    ) : (
                      <span className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center text-[18px] font-medium tracking-[-0.02em] text-[#252629]">
                        {rowNo}
                      </span>
                    )}

                    <span className="min-w-0 flex-1 truncate text-[17px] font-medium tracking-[-0.02em] text-[#252629]">
                      {item.title}
                    </span>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#efefef] text-center text-[#2f2f2f]">
              <th className="w-20 py-3 font-medium">No.</th>
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="w-28 py-3 font-medium">작성자</th>
              <th className="w-32 py-3 font-medium">작성일</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-neutral-500">
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const rowNo = totalCount - (currentPage - 1) * 10 - index

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#ececec] text-[#2f2f2f]"
                  >
                    <td className="py-3 text-center text-xs font-medium text-[#666]">
                      {item.isPinned ? (
                        <span className="inline-block text-xs font-semibold text-[#3b3b3b]">
                          공지
                        </span>
                      ) : (
                        rowNo
                      )}
                    </td>

                    <td className="px-4 py-3 text-left text-[15px]">
                      <Link
                        href={`/notice/notices/${item.id}`}
                        className="line-clamp-1 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>

                    <td className="py-3 text-center text-xs text-[#444]">
                      {item.authorName}
                    </td>

                    <td className="py-3 text-center text-xs text-[#666]">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-6 md:relative md:h-10 md:space-y-0">
        <div className="flex items-center justify-center gap-4 md:gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex size-[56px] items-center justify-center rounded-full text-[#252629] transition-colors hover:bg-[#f5f5f5] md:h-7 md:w-7 md:bg-[#f5f5f5] md:text-[#888] md:hover:bg-[#ececec]"
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-7 w-7 md:h-4 md:w-4" />
            </Link>
          ) : (
            <span className="inline-flex size-[56px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0] md:h-7 md:w-7">
              <ChevronLeft className="h-7 w-7 md:h-4 md:w-4" />
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
              <ChevronRight className="h-7 w-7 md:h-4 md:w-4" />
            </Link>
          ) : (
            <span className="inline-flex size-[56px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#d0d0d0] md:h-7 md:w-7">
              <ChevronRight className="h-7 w-7 md:h-4 md:w-4" />
            </span>
          )}
        </div>

        <form
          action="/notice/notices"
          className="relative mx-auto w-full md:absolute md:right-0 md:top-0 md:mx-0 md:max-w-[200px] lg:max-w-[260px]"
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
            aria-label="공지사항 검색"
            className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[#252629] md:right-3 md:text-[#8d8d8d]"
          >
            <Search className="h-7 w-7 md:h-4 md:w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
