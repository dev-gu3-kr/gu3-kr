"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

import type { HomeSchedulerItem } from "@/features/home/isomorphic"

type HomeSchedulerSectionProps = {
  readonly monthLabel: string
  readonly items: readonly HomeSchedulerItem[]
  readonly pageResetMode: "active" | "start" | "end"
  readonly onRequestPreviousMonth: () => void
  readonly onRequestNextMonth: () => void
}

const SCHEDULER_PAGE_SIZE = 9

function getInitialPageStart(
  items: readonly HomeSchedulerItem[],
  pageResetMode: HomeSchedulerSectionProps["pageResetMode"],
) {
  if (pageResetMode === "start") return 0

  if (pageResetMode === "end") {
    return Math.max(0, items.length - SCHEDULER_PAGE_SIZE)
  }

  const activeIndex = items.findIndex((item) => item.isActive)
  if (activeIndex < 0) return 0

  return Math.floor(activeIndex / SCHEDULER_PAGE_SIZE) * SCHEDULER_PAGE_SIZE
}

export function HomeSchedulerSection({
  monthLabel,
  items,
  pageResetMode,
  onRequestPreviousMonth,
  onRequestNextMonth,
}: HomeSchedulerSectionProps) {
  const [pageStart, setPageStart] = React.useState(() =>
    getInitialPageStart(items, pageResetMode),
  )

  React.useEffect(() => {
    setPageStart(getInitialPageStart(items, pageResetMode))
  }, [items, pageResetMode])

  const visibleItems = React.useMemo(
    () => items.slice(pageStart, pageStart + SCHEDULER_PAGE_SIZE),
    [items, pageStart],
  )

  const handlePreviousPage = React.useCallback(() => {
    if (pageStart === 0) {
      onRequestPreviousMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.max(0, currentPageStart - SCHEDULER_PAGE_SIZE),
    )
  }, [onRequestPreviousMonth, pageStart])

  const handleNextPage = React.useCallback(() => {
    if (pageStart + SCHEDULER_PAGE_SIZE >= items.length) {
      onRequestNextMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.min(
        Math.max(0, items.length - SCHEDULER_PAGE_SIZE),
        currentPageStart + SCHEDULER_PAGE_SIZE,
      ),
    )
  }, [items.length, onRequestNextMonth, pageStart])

  return (
    <section className="bg-[#f5f6f8] px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-10 flex items-center justify-center gap-4">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5"
            onClick={handlePreviousPage}
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="min-w-42 text-center text-2xl font-semibold text-[#252629] md:text-[26px]">
            {monthLabel}
          </h2>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5"
            onClick={handleNextPage}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-5 lg:grid-cols-5 xl:grid-cols-9">
          {visibleItems.map((item) => (
            <article key={item.dateIso} className="text-center">
              <div
                className={`mx-auto grid h-[78px] w-[78px] place-items-center rounded-full sm:h-[86px] sm:w-[86px] ${
                  item.isActive
                    ? "bg-white shadow-sm ring-1 ring-black/5"
                    : "bg-[#ebecf0]"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[#8c8e93]">
                    {item.dayLabel}
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      item.isActive ? "text-[#bd2125]" : "text-[#252629]"
                    }`}
                  >
                    {item.dayNumber}
                  </p>
                </div>
              </div>
              <div className="mt-4 min-h-12">
                {item.events.length > 0 ? (
                  <div className="space-y-1">
                    <div className="mx-auto size-2 rounded-full bg-[#bd2125]" />
                    {item.events.map((event) => (
                      <p
                        key={`${item.dateIso}-${event}`}
                        className="text-xs leading-4 text-[#252629] md:text-[13px]"
                      >
                        {event}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-[#a1a4aa]">예정 없음</div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
