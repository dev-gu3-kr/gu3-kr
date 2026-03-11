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
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        공지사항
      </h2>
      <div className="mt-4 overflow-x-auto">
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

                    <td className="px-4 py-3 text-left text-[13px]">
                      <Link
                        href={`/notice/notices/${item.id}`}
                        className="line-clamp-1 hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>

                    <td className="py-3 text-center text-xs text-[#444]">
                      관리자
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
          action="/notice/notices"
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
