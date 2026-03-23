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

const HOME_SCHEDULER_PAGE_SIZE = 7

function getDefaultSelectedDateIso(items: readonly HomeSchedulerItem[]) {
  return (
    items.find((item) => item.isActive)?.dateIso ??
    items.find((item) => item.events.length > 0)?.dateIso ??
    items[0]?.dateIso ??
    null
  )
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
  const [pageStart, setPageStart] = React.useState(() =>
    getInitialPageStart(items, pageResetMode, HOME_SCHEDULER_PAGE_SIZE),
  )
  const [slideDirection, setSlideDirection] = React.useState<1 | -1>(1)
  const [selectedDateIso, setSelectedDateIso] = React.useState<string | null>(
    null,
  )

  React.useLayoutEffect(() => {
    setPageStart(
      getInitialPageStart(items, pageResetMode, HOME_SCHEDULER_PAGE_SIZE),
    )
  }, [items, pageResetMode])

  const initialActivePageStart = React.useMemo(
    () => getInitialPageStart(items, "active", HOME_SCHEDULER_PAGE_SIZE),
    [items],
  )

  const visibleItems = React.useMemo(
    () =>
      pageResetMode === "active" && pageStart === initialActivePageStart
        ? buildCenteredWindow(
            items,
            pageStart,
            pageResetMode,
            HOME_SCHEDULER_PAGE_SIZE,
          )
        : items.slice(pageStart, pageStart + HOME_SCHEDULER_PAGE_SIZE),
    [initialActivePageStart, items, pageResetMode, pageStart],
  )
  const defaultSelectedDateIso = React.useMemo(
    () => getDefaultSelectedDateIso(visibleItems),
    [visibleItems],
  )
  const resolvedSelectedDateIso = React.useMemo(() => {
    if (
      selectedDateIso &&
      visibleItems.some((item) => item.dateIso === selectedDateIso)
    ) {
      return selectedDateIso
    }

    return defaultSelectedDateIso
  }, [defaultSelectedDateIso, selectedDateIso, visibleItems])
  const selectedItem = React.useMemo(
    () =>
      visibleItems.find((item) => item.dateIso === resolvedSelectedDateIso) ??
      null,
    [resolvedSelectedDateIso, visibleItems],
  )

  // Paging should keep the selected summary anchored to the currently visible week.
  React.useEffect(() => {
    setSelectedDateIso(resolvedSelectedDateIso)
  }, [resolvedSelectedDateIso])

  const mobileMonthLabel = React.useMemo(() => {
    const baseDate = items[0] ? new Date(items[0].dateIso) : null
    return baseDate
      ? format(baseDate, "yyyy. M", { locale: ko })
      : monthLabel.replace("년 ", ". ").replace("월", "")
  }, [items, monthLabel])

  const windowKey = React.useMemo(() => {
    const first = visibleItems[0]?.dateIso ?? "none"
    const last = visibleItems[visibleItems.length - 1]?.dateIso ?? "none"
    return `${monthLabel}-${pageStart}-${HOME_SCHEDULER_PAGE_SIZE}-${first}-${last}`
  }, [monthLabel, pageStart, visibleItems])

  const handlePreviousPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(-1)

    if (pageStart === 0) {
      onRequestPreviousMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.max(0, currentPageStart - HOME_SCHEDULER_PAGE_SIZE),
    )
  }, [isNavigatingMonth, onRequestPreviousMonth, pageStart])

  const handleNextPage = React.useCallback(() => {
    if (isNavigatingMonth) return

    setSlideDirection(1)

    if (pageStart + HOME_SCHEDULER_PAGE_SIZE >= items.length) {
      onRequestNextMonth()
      return
    }

    setPageStart((currentPageStart) =>
      Math.min(
        Math.max(0, items.length - HOME_SCHEDULER_PAGE_SIZE),
        currentPageStart + HOME_SCHEDULER_PAGE_SIZE,
      ),
    )
  }, [isNavigatingMonth, items.length, onRequestNextMonth, pageStart])

  return (
    <section className="bg-[#f5f6f8] px-5 py-12 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1220px]">
        <div className="mb-8 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-white text-[#252629] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handlePreviousPage}
            disabled={isNavigatingMonth}
            aria-label="이전 일정 보기"
          >
            <ChevronLeft className="size-7" />
          </button>

          <h2 className="text-center text-[30px] font-semibold leading-none text-[#252629]">
            {mobileMonthLabel}
          </h2>

          <button
            type="button"
            className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-white text-[#252629] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleNextPage}
            disabled={isNavigatingMonth}
            aria-label="다음 일정 보기"
          >
            <ChevronRight className="size-7" />
          </button>
        </div>

        <div className="relative mb-8 hidden items-center justify-center md:flex">
          <h2 className="text-center text-[30px] font-semibold text-[#252629]">
            {monthLabel}
          </h2>

          <Link
            href="/notice/parish-calendar"
            className="absolute right-0 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-[#252629] shadow-sm ring-1 ring-black/5 hover:bg-[#fafafa]"
          >
            <CalendarDays className="size-4" />
            전체보기
          </Link>
        </div>

        <div className="relative md:px-14">
          <button
            type="button"
            className="absolute left-0 top-[56px] hidden size-8 place-items-center rounded-full bg-white text-[#686a6f] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-[#f2f3f5] hover:text-[#252629] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50 md:grid"
            onClick={handlePreviousPage}
            disabled={isNavigatingMonth}
            aria-label="이전 일정 보기"
          >
            <ChevronLeft className="size-4" />
          </button>

          <button
            type="button"
            className="absolute right-0 top-[56px] hidden size-8 place-items-center rounded-full bg-white text-[#686a6f] shadow-sm ring-1 ring-black/5 transition-colors hover:bg-[#f2f3f5] hover:text-[#252629] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 disabled:cursor-not-allowed disabled:opacity-50 md:grid"
            onClick={handleNextPage}
            disabled={isNavigatingMonth}
            aria-label="다음 일정 보기"
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
                <div className="grid grid-cols-7 gap-1 md:gap-4">
                  {visibleItems.map((item) => (
                    <article key={item.dateIso} className="text-center">
                      <p className="text-sm text-[#a0a2a7]">{item.dayLabel}</p>

                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          aria-pressed={
                            item.dateIso === resolvedSelectedDateIso
                          }
                          className={
                            item.dateIso === resolvedSelectedDateIso
                              ? "grid h-12 w-12 place-items-center rounded-full border-2 border-[#bd2125] text-[24px] font-semibold leading-none text-[#bd2125] transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 md:h-[60px] md:w-[60px] md:text-[32px] md:text-[#252629]"
                              : "grid h-12 w-12 place-items-center text-[24px] font-semibold leading-none text-[#252629] transition-colors hover:text-[#bd2125] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bd2125]/35 md:h-[60px] md:w-[60px] md:text-[32px]"
                          }
                          onClick={() => setSelectedDateIso(item.dateIso)}
                        >
                          {item.dayNumber}
                        </button>
                      </div>

                      <div className="mt-3 flex min-h-4 justify-center md:mt-4 md:min-h-10">
                        {item.events.length > 0 ? (
                          <div className="flex flex-col items-center gap-1 md:gap-1.5">
                            <div className="flex items-center justify-center">
                              <span className="size-2 rounded-full bg-[#bd2125]" />
                            </div>
                            <div className="hidden space-y-1 md:block">
                              {item.events.slice(0, 2).map((event) => (
                                <p
                                  key={`${item.dateIso}-${event.title}`}
                                  className="line-clamp-1 text-xs leading-4 text-[#252629]"
                                >
                                  {event.title}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-4 md:min-h-10" />
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4 md:hidden">
          <div className="min-w-0 flex-1">
            {selectedItem?.events.length ? (
              <div className="space-y-1 text-[13px] font-medium leading-[1.35] text-[#252629]">
                {selectedItem.events.slice(0, 2).map((event) => (
                  <p
                    key={`${selectedItem.dateIso}-${event.title}`}
                    className="line-clamp-1"
                  >
                    {event.title}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-[13px] font-medium leading-[1.35] text-[#686a6f]">
                선택한 날짜에 등록된 일정이 없습니다.
              </p>
            )}
          </div>

          <Link
            href="/notice/parish-calendar"
            className="inline-flex shrink-0 items-center gap-2 rounded-[18px] bg-white px-4 py-3 text-sm font-semibold text-[#252629] shadow-sm ring-1 ring-black/5 hover:bg-[#fafafa]"
          >
            <CalendarDays className="size-4" />
            전체보기
          </Link>
        </div>
      </div>
    </section>
  )
}
