"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { AnimatePresence, motion } from "framer-motion"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"

import { AppLink as Link } from "@/components/AppLink"
import type { HomeSchedulerItem } from "@/features/home/isomorphic"

type HomeSchedulerSectionProps = {
  readonly monthLabel: string
  readonly items: readonly HomeSchedulerItem[]
  readonly pageResetMode: "active" | "start" | "end"
  readonly isNavigatingMonth?: boolean
  readonly onRequestPreviousMonth: () => void
  readonly onRequestNextMonth: () => void
}

function getInitialPageStart(
  items: readonly HomeSchedulerItem[],
  pageResetMode: HomeSchedulerSectionProps["pageResetMode"],
  pageSize: number,
) {
  if (pageResetMode === "start") return 0

  if (pageResetMode === "end") {
    return Math.max(0, items.length - pageSize)
  }

  const activeIndex = items.findIndex((item) => item.isActive)
  if (activeIndex < 0) return 0

  const centerOffset = Math.floor(pageSize / 2)
  const maxStart = Math.max(0, items.length - pageSize)

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
  pageSize: number,
) {
  if (items.length === 0) return [] as HomeSchedulerItem[]

  if (pageResetMode !== "active") {
    return items.slice(pageStart, pageStart + pageSize)
  }

  const activeIndex = items.findIndex((item) => item.isActive)
  if (activeIndex < 0) {
    return items.slice(pageStart, pageStart + pageSize)
  }

  const centerOffset = Math.floor(pageSize / 2)
  const desiredStart = activeIndex - centerOffset
  const desiredEnd = desiredStart + pageSize

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
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const pageSize = isMobile ? 9 : 7

  const [pageStart, setPageStart] = React.useState(() =>
    getInitialPageStart(items, pageResetMode, pageSize),
  )
  const [slideDirection, setSlideDirection] = React.useState<1 | -1>(1)

  React.useLayoutEffect(() => {
    setPageStart(getInitialPageStart(items, pageResetMode, pageSize))
  }, [items, pageResetMode, pageSize])

  const initialActivePageStart = React.useMemo(
    () => getInitialPageStart(items, "active", pageSize),
    [items, pageSize],
  )

  const visibleItems = React.useMemo(
    () =>
      pageResetMode === "active" && pageStart === initialActivePageStart
        ? buildCenteredWindow(items, pageStart, pageResetMode, pageSize)
        : items.slice(pageStart, pageStart + pageSize),
    [initialActivePageStart, items, pageResetMode, pageSize, pageStart],
  )

  const windowKey = React.useMemo(() => {
    const first = visibleItems[0]?.dateIso ?? "none"
    const last = visibleItems[visibleItems.length - 1]?.dateIso ?? "none"
    return `${monthLabel}-${pageStart}-${pageSize}-${first}-${last}`
  }, [monthLabel, pageSize, pageStart, visibleItems])

  const handlePreviousPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(-1)

    if (pageStart === 0) {
      onRequestPreviousMonth()
      return
    }

    setPageStart((currentPageStart) => Math.max(0, currentPageStart - pageSize))
  }, [isNavigatingMonth, onRequestPreviousMonth, pageSize, pageStart])

  const handleNextPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(1)

    if (pageStart + pageSize >= items.length) {
      onRequestNextMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.min(
        Math.max(0, items.length - pageSize),
        currentPageStart + pageSize,
      ),
    )
  }, [isNavigatingMonth, items.length, onRequestNextMonth, pageSize, pageStart])

  return (
    <section className="bg-[#f5f6f8] px-5 py-12 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1220px]">
        <div className="relative mb-8 flex items-center justify-center">
          <h2 className="text-center text-[24px] font-semibold text-[#252629] md:text-[30px]">
            {monthLabel}
          </h2>

          <Link
            href="/notice/parish-calendar"
            className="absolute right-0 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-2 text-xs font-medium text-[#252629] shadow-sm ring-1 ring-black/5 hover:bg-[#fafafa] md:gap-2 md:px-4 md:py-2.5 md:text-sm"
          >
            <CalendarDays className="size-3.5 md:size-4" />
            전체보기
          </Link>
        </div>

        <div className="relative px-10 md:px-14">
          <button
            type="button"
            className="absolute left-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#686a6f] shadow-sm ring-1 ring-black/5 cursor-pointer transition-colors hover:bg-[#f2f3f5] hover:text-[#252629] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50 md:top-[56px] md:translate-y-0"
            onClick={handlePreviousPage}
            disabled={isNavigatingMonth}
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            className="absolute right-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#686a6f] shadow-sm ring-1 ring-black/5 cursor-pointer transition-colors hover:bg-[#f2f3f5] hover:text-[#252629] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50 md:top-[56px] md:translate-y-0"
            onClick={handleNextPage}
            disabled={isNavigatingMonth}
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="overflow-hidden">
            <AnimatePresence
              initial={false}
              mode="wait"
              custom={slideDirection}
            >
              <motion.div
                key={windowKey}
                className="w-full"
                custom={slideDirection}
                initial={{ opacity: 0, x: slideDirection > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection > 0 ? -36 : 36 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="grid grid-cols-3 gap-2 md:grid-cols-7 md:gap-4">
                  {visibleItems.map((item) => (
                    <article key={item.dateIso} className="text-center">
                      <p className="text-sm text-[#a0a2a7]">{item.dayLabel}</p>

                      <div className="mt-2 flex justify-center">
                        <div
                          className={
                            item.isActive
                              ? "grid h-[60px] w-[60px] place-items-center rounded-full border-2 border-[#bd2125] text-[32px] font-semibold leading-none text-[#252629]"
                              : "grid h-[60px] w-[60px] place-items-center text-[32px] font-semibold leading-none text-[#252629]"
                          }
                        >
                          {item.dayNumber}
                        </div>
                      </div>

                      <div className="mt-4 min-h-10">
                        {item.events.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center">
                              <span className="size-2 rounded-full bg-[#bd2125]" />
                            </div>
                            {item.events.slice(0, 2).map((event) => (
                              <p
                                key={`${item.dateIso}-${event.title}`}
                                className="line-clamp-1 text-[11px] leading-4 text-[#252629] md:text-xs"
                              >
                                {event.title}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
