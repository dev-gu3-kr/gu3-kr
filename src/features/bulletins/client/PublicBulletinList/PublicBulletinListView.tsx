import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react"
import { AppLink as Link } from "@/components/AppLink"
import type { BulletinPublicListItemDto } from "@/features/bulletins/isomorphic"

type PublicBulletinListViewProps = {
  items: BulletinPublicListItemDto[]
  totalCount: number
  currentPage: number
  totalPages: number
  query: string
  pageNumbers: number[]
}

function buildPageHref(pageNo: number, query: string) {
  return query
    ? `/notice/weekly-bulletin?page=${pageNo}&q=${encodeURIComponent(query)}`
    : `/notice/weekly-bulletin?page=${pageNo}`
}

export function PublicBulletinListView({
  items,
  totalCount,
  currentPage,
  totalPages,
  query,
  pageNumbers,
}: PublicBulletinListViewProps) {
  const prevHref =
    currentPage > 1 ? buildPageHref(currentPage - 1, query) : null
  const nextHref =
    currentPage < totalPages ? buildPageHref(currentPage + 1, query) : null

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-5 md:px-8 md:py-14">
      <h2 className="text-[30px] font-semibold tracking-[-0.02em] text-[#252629]">
        본당 주보
      </h2>

      <div className="mt-8 md:hidden">
        {items.length === 0 ? (
          <div className="border-y border-[#ececec] py-10 text-center text-sm text-neutral-500">
            등록된 본당주보가 없습니다.
          </div>
        ) : (
          <div>
            {items.map((item, index) => {
              const rowNo = totalCount - (currentPage - 1) * 10 - index
              const attachment = item.attachments[0]

              return (
                <article
                  key={item.id}
                  className="border-b border-[#ececec] text-[#252629]"
                >
                  <div className="flex items-center gap-3 py-6">
                    <Link
                      href={`/notice/weekly-bulletin/${item.id}`}
                      className="flex min-w-0 flex-1 items-center gap-4"
                    >
                      <span className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center text-[18px] font-medium tracking-[-0.02em] text-[#252629]">
                        {rowNo}
                      </span>

                      <span className="min-w-0 flex-1 truncate text-[17px] font-medium tracking-[-0.02em] text-[#252629]">
                        {item.title}
                      </span>
                    </Link>

                    {attachment ? (
                      <a
                        href={`/api/bulletins/${item.id}/download`}
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#d9d9d9] bg-[#faf7f7] px-4 py-2 text-[13px] font-semibold text-[#8b1e1e] transition-colors hover:bg-[#f5eeee]"
                      >
                        다운
                      </a>
                    ) : null}
                  </div>
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
              <th className="w-32 py-3 font-medium">다운로드</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-neutral-500">
                  등록된 본당주보가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const rowNo = totalCount - (currentPage - 1) * 10 - index
                const attachment = item.attachments[0]

                return (
                  <tr
                    key={item.id}
                    className="border-b border-[#ececec] text-[#2f2f2f]"
                  >
                    <td className="py-3 text-center text-xs font-medium text-[#666]">
                      {rowNo}
                    </td>

                    <td className="px-4 py-3 text-left text-[15px]">
                      <Link
                        href={`/notice/weekly-bulletin/${item.id}`}
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

                    <td className="py-3 text-center">
                      {attachment ? (
                        <a
                          href={`/api/bulletins/${item.id}/download`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#d9d9d9] bg-[#faf7f7] px-3 py-1.5 text-xs font-semibold text-[#8b1e1e] transition-colors hover:bg-[#f5eeee]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          다운로드
                        </a>
                      ) : (
                        <span className="text-xs text-[#b0b0b0]">-</span>
                      )}
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
          action="/notice/weekly-bulletin"
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
            aria-label="본당주보 검색"
            className="absolute right-4 top-1/2 inline-flex -translate-y-1/2 items-center justify-center text-[#252629] md:right-3 md:text-[#8d8d8d]"
          >
            <Search className="h-7 w-7 md:h-4 md:w-4" />
          </button>
        </form>
      </div>
    </section>
  )
}
