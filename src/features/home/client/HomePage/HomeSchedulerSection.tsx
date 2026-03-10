"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

import type { HomeSchedulerItem } from "@/features/home/isomorphic"

type HomeSchedulerSectionProps = {
  readonly monthLabel: string
  readonly items: readonly HomeSchedulerItem[]
  readonly pageResetMode: "active" | "start" | "end"
  readonly isNavigatingMonth?: boolean
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

  const centerOffset = Math.floor(SCHEDULER_PAGE_SIZE / 2)
  const maxStart = Math.max(0, items.length - SCHEDULER_PAGE_SIZE)

  return Math.min(maxStart, Math.max(0, activeIndex - centerOffset))
}

function toSyntheticItem(date: Date): HomeSchedulerItem {
  return {
    dateIso: date.toISOString(),
    dayLabel: format(date, "EEE", { locale: ko }).slice(0, 1),
    dayNumber: date.getDate(),
    isActive: false,
    events: [],
  }
}

function buildCenteredWindow(
  items: readonly HomeSchedulerItem[],
  pageStart: number,
  pageResetMode: HomeSchedulerSectionProps["pageResetMode"],
) {
  if (items.length === 0) return [] as HomeSchedulerItem[]

  if (pageResetMode !== "active") {
    return items.slice(pageStart, pageStart + SCHEDULER_PAGE_SIZE)
  }

  const activeIndex = items.findIndex((item) => item.isActive)
  if (activeIndex < 0) {
    return items.slice(pageStart, pageStart + SCHEDULER_PAGE_SIZE)
  }

  const centerOffset = Math.floor(SCHEDULER_PAGE_SIZE / 2)
  const desiredStart = activeIndex - centerOffset
  const desiredEnd = desiredStart + SCHEDULER_PAGE_SIZE

  const start = Math.max(0, desiredStart)
  const end = Math.min(items.length, desiredEnd)

  const middle = items.slice(start, end)
  const leftPadCount = Math.max(0, -desiredStart)
  const rightPadCount = Math.max(0, desiredEnd - items.length)

  const firstDate = new Date(items[0].dateIso)
  const lastDate = new Date(items[items.length - 1].dateIso)

  const leftPad = Array.from({ length: leftPadCount }, (_, idx) => {
    const d = new Date(firstDate)
    d.setDate(firstDate.getDate() - (leftPadCount - idx))
    return toSyntheticItem(d)
  })

  const rightPad = Array.from({ length: rightPadCount }, (_, idx) => {
    const d = new Date(lastDate)
    d.setDate(lastDate.getDate() + idx + 1)
    return toSyntheticItem(d)
  })

  return [...leftPad, ...middle, ...rightPad]
}

export function HomeSchedulerSection({
  monthLabel,
  items,
  pageResetMode,
  isNavigatingMonth = false,
  onRequestPreviousMonth,
  onRequestNextMonth,
}: HomeSchedulerSectionProps) {
  const [pageStart, setPageStart] = React.useState(() =>
    getInitialPageStart(items, pageResetMode),
  )
  const [slideDirection, setSlideDirection] = React.useState<1 | -1>(1)

  React.useLayoutEffect(() => {
    setPageStart(getInitialPageStart(items, pageResetMode))
  }, [items, pageResetMode])

  const initialActivePageStart = React.useMemo(
    () => getInitialPageStart(items, "active"),
    [items],
  )

  const visibleItems = React.useMemo(
    () =>
      pageResetMode === "active" && pageStart === initialActivePageStart
        ? buildCenteredWindow(items, pageStart, pageResetMode)
        : items.slice(pageStart, pageStart + SCHEDULER_PAGE_SIZE),
    [initialActivePageStart, items, pageResetMode, pageStart],
  )

  const windowKey = React.useMemo(() => {
    const first = visibleItems[0]?.dateIso ?? "none"
    const last = visibleItems[visibleItems.length - 1]?.dateIso ?? "none"
    return `${monthLabel}-${pageStart}-${first}-${last}`
  }, [monthLabel, pageStart, visibleItems])

  const handlePreviousPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(-1)

    if (pageStart === 0) {
      onRequestPreviousMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.max(0, currentPageStart - SCHEDULER_PAGE_SIZE),
    )
  }, [isNavigatingMonth, onRequestPreviousMonth, pageStart])

  const handleNextPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(1)

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
  }, [isNavigatingMonth, items.length, onRequestNextMonth, pageStart])

  return (
    <section className="bg-[#f5f6f8] px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-10 flex items-center justify-center gap-4">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handlePreviousPage}
            disabled={isNavigatingMonth}
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="min-w-42 text-center text-2xl font-semibold text-[#252629] md:text-[26px]">
            {monthLabel}
          </h2>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl bg-white text-[#252629] shadow-sm ring-1 ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleNextPage}
            disabled={isNavigatingMonth}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="overflow-hidden">
          <AnimatePresence initial={false} mode="wait" custom={slideDirection}>
            <motion.div
              key={windowKey}
              className="w-full"
              custom={slideDirection}
              initial={{ opacity: 0, x: slideDirection > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDirection > 0 ? -40 : 40 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
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
                          <div className="flex items-center justify-center gap-1.5">
                            {item.events.length === 1 ? (
                              <span className="size-2 rounded-full bg-[#bd2125]" />
                            ) : (
                              <>
                                <span className="size-2 rounded-full bg-[#bd2125]" />
                                <span className="size-2 rounded-full bg-[#bd2125]" />
                                <span className="rounded-[4px] bg-[#bd2125] px-1.5 py-[1px] text-[11px] font-semibold leading-none text-white">
                                  +{item.events.length}
                                </span>
                              </>
                            )}
                          </div>
                          {item.events.slice(0, 2).map((event) => (
                            <p
                              key={`${item.dateIso}-${event}`}
                              className="line-clamp-1 text-xs leading-4 text-[#252629] md:text-[13px]"
                            >
                              {event}
                            </p>
                          ))}
                        </div>
                      ) : null
                      }
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
