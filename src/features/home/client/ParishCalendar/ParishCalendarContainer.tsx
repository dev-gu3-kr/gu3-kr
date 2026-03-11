"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import type { HomeSchedulerItem } from "@/features/home/isomorphic"
import { useHomePageQuery } from "@/features/home/isomorphic"

function formatMonthKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${String(date.getFullYear())}-${month}`
}

function shiftMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number)
  return formatMonthKey(new Date(year, month - 1 + offset, 1))
}

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

type CalendarCell = {
  date: Date
  dateKey: string
  inCurrentMonth: boolean
  events: readonly { title: string; description: string }[]
}

function buildMonthCells(
  monthKey: string,
  items: readonly HomeSchedulerItem[],
) {
  const [year, month] = monthKey.split("-").map(Number)
  const first = new Date(year, month - 1, 1)
  const firstWeekday = first.getDay()
  const lastDate = new Date(year, month, 0).getDate()

  const eventMap = new Map<
    string,
    readonly { title: string; description: string }[]
  >()
  for (const item of items) {
    eventMap.set(toDateKey(new Date(item.dateIso)), item.events)
  }

  const cells: CalendarCell[] = []

  if (firstWeekday > 0) {
    const prevLastDate = new Date(year, month - 1, 0).getDate()
    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const date = new Date(year, month - 2, prevLastDate - i)
      cells.push({
        date,
        dateKey: toDateKey(date),
        inCurrentMonth: false,
        events: [],
      })
    }
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const date = new Date(year, month - 1, day)
    const dateKey = toDateKey(date)
    cells.push({
      date,
      dateKey,
      inCurrentMonth: true,
      events: eventMap.get(dateKey) ?? [],
    })
  }

  const remain = 42 - cells.length
  for (let day = 1; day <= remain; day += 1) {
    const date = new Date(year, month, day)
    cells.push({
      date,
      dateKey: toDateKey(date),
      inCurrentMonth: false,
      events: [],
    })
  }

  return cells
}

export function ParishCalendarContainer() {
  const today = React.useMemo(() => new Date(), [])
  const todayKey = React.useMemo(() => toDateKey(today), [today])

  const [monthKey, setMonthKey] = React.useState(() => formatMonthKey(today))
  const [windowCenterMonthKey, setWindowCenterMonthKey] =
    React.useState(monthKey)
  const { data, isFetching } = useHomePageQuery(windowCenterMonthKey)

  const schedulerMonthData = data?.schedulerByMonth[monthKey]
  const schedulerItems = schedulerMonthData?.schedulerItems ?? []
  const monthLabel =
    schedulerMonthData?.schedulerMonthLabel ??
    format(new Date(`${monthKey}-01`), "yyyy. M", { locale: ko })

  const cells = React.useMemo(
    () => buildMonthCells(monthKey, schedulerItems),
    [monthKey, schedulerItems],
  )

  const [selectedDateKey, setSelectedDateKey] = React.useState(() => todayKey)

  React.useEffect(() => {
    const monthPrefix = `${monthKey}-`
    if (!selectedDateKey.startsWith(monthPrefix)) {
      const firstCurrent = cells.find((cell) => cell.inCurrentMonth)
      if (firstCurrent) setSelectedDateKey(firstCurrent.dateKey)
    }
  }, [cells, monthKey, selectedDateKey])

  const selectedCell =
    cells.find((cell) => cell.dateKey === selectedDateKey) ??
    cells.find((cell) => cell.inCurrentMonth) ??
    cells[0]

  const selectedDateText = selectedCell
    ? format(selectedCell.date, "yyyy. M. d (EEE)", { locale: ko })
    : ""

  const moveMonth = React.useCallback(
    (offset: number) => {
      setMonthKey((currentMonthKey) => {
        const nextMonthKey = shiftMonth(currentMonthKey, offset)
        if (!data?.schedulerByMonth[nextMonthKey]) {
          setWindowCenterMonthKey(nextMonthKey)
        }
        return nextMonthKey
      })
    },
    [data],
  )

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-14">
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#252629] md:text-3xl">
        본당 달력
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4 flex items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              disabled={isFetching}
              className="cursor-pointer rounded-full p-2 text-[#555] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:opacity-50"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h3 className="text-[32px] font-semibold leading-none text-[#1f1f1f]">
              {monthLabel}
            </h3>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              disabled={isFetching}
              className="cursor-pointer rounded-full p-2 text-[#555] hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:opacity-50"
              aria-label="다음 달"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-7 rounded-t bg-[#efefef] py-3 text-center text-sm text-[#555]">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="border-b border-[#e2e2e2]">
            {Array.from({ length: 6 }).map((_, weekIndex) => {
              const weekCells = cells.slice(weekIndex * 7, weekIndex * 7 + 7)
              return (
                <div
                  key={String(weekIndex)}
                  className="grid grid-cols-7 border-t border-[#e8e8e8] py-3 text-center"
                >
                  {weekCells.map((cell) => {
                    const isToday = cell.dateKey === todayKey
                    const isSelected = cell.dateKey === selectedDateKey
                    const isSunday = cell.date.getDay() === 0
                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        className={
                          isSelected
                            ? "flex flex-col items-center justify-center gap-1 rounded-md bg-[#f7e9e9] py-1"
                            : "flex flex-col items-center justify-center gap-1 rounded-md py-1 hover:bg-[#f4f4f4] cursor-pointer"
                        }
                        onClick={() => setSelectedDateKey(cell.dateKey)}
                      >
                        <span
                          className={
                            isToday
                              ? "flex h-9 w-9 items-center justify-center rounded-full border border-[#ad4a4a] text-[20px] font-semibold text-[#1f1f1f]"
                              : cell.inCurrentMonth
                                ? isSunday
                                  ? "text-[20px] font-semibold text-[#b33]"
                                  : "text-[20px] font-semibold text-[#1f1f1f]"
                                : "text-[20px] font-medium text-[#c4c4c4]"
                          }
                        >
                          {cell.date.getDate()}
                        </span>
                        {cell.inCurrentMonth && cell.events.length > 0 ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#b33]" />
                        ) : (
                          <span className="h-1.5 w-1.5" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        <aside className="bg-[#efefef] p-5 text-sm text-[#222]">
          <p className="font-semibold">{selectedDateText} 본당 일정</p>
          <div className="mt-3 space-y-3">
            {selectedCell?.events.length ? (
              selectedCell.events.map((event) => (
                <div key={event.title} className="space-y-1 leading-5">
                  <p className="font-semibold text-[#1f1f1f]">{event.title}</p>
                  <p className="text-[#444]">{event.description || "-"}</p>
                </div>
              ))
            ) : (
              <p className="text-[#666]">등록된 일정이 없습니다.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
