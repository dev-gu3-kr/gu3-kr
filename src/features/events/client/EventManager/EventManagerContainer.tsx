"use client"

import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type EventPublishFilterDto,
  useEventListInfinite,
  useEventSchedulerQuery,
} from "@/features/events/isomorphic"
import { useEventManagerViewMode } from "../EventManagerViewModeContext"

export function EventManagerContainer() {
  const router = useRouter()
  const { viewMode, setViewMode } = useEventManagerViewMode()

  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<EventPublishFilterDto>("all")
  const [calendarRange, setCalendarRange] = useState<{
    from: string
    to: string
  } | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(queryInput.trim())
    }, 300)

    return () => window.clearTimeout(timer)
  }, [queryInput])

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useEventListInfinite({
      filters: { query, status },
    })

  const { data: schedulerItems = [], isFetching: isSchedulerFetching } =
    useEventSchedulerQuery({
      from: calendarRange?.from,
      to: calendarRange?.to,
      query,
      status,
    })

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  )

  const isFilterFetching = isFetching && !isFetchingNextPage

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || !hasNextPage || isFetchingNextPage) {
          return
        }
        await fetchNextPage()
      },
      { rootMargin: "240px 0px" },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const calendarEvents = useMemo(
    () =>
      schedulerItems.map((item) => {
        const startAt = new Date(item.startsAt)
        const endAt = new Date(item.endsAt)
        const safeEndAt =
          endAt > startAt ? endAt : new Date(startAt.getTime() + 60_000)

        return {
          id: item.id,
          title: item.title,
          start: startAt.toISOString(),
          end: safeEndAt.toISOString(),
          allDay: false,
          backgroundColor: item.isPublished ? "#3b82f6" : "#6b7280",
          borderColor: item.isPublished ? "#3b82f6" : "#6b7280",
          textColor: "#ffffff",
        }
      }),
    [schedulerItems],
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-md border p-1">
          <button
            type="button"
            onClick={() => setViewMode("scheduler")}
            className={
              viewMode === "scheduler"
                ? "cursor-pointer rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            }
          >
            스케줄러
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list"
                ? "cursor-pointer rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            }
          >
            리스트
          </button>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </div>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "published" ||
                value === "draft"
              ) {
                setStatus(value)
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="전체">
              전체
            </ToggleGroupItem>
            <ToggleGroupItem value="published" aria-label="공개">
              공개
            </ToggleGroupItem>
            <ToggleGroupItem value="draft" aria-label="비공개">
              비공개
            </ToggleGroupItem>
          </ToggleGroup>

          {isFilterFetching || isFetchingNextPage || isSchedulerFetching ? (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:hidden">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              불러오는 중
            </p>
          ) : null}
        </div>

        <div className="relative sm:max-w-sm sm:flex-1">
          <input
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="검색"
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>

        {isFilterFetching || isFetchingNextPage || isSchedulerFetching ? (
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            불러오는 중
          </p>
        ) : null}
      </section>

      {viewMode === "scheduler" ? (
        <div className="event-scheduler overflow-hidden rounded-md border bg-white p-2">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            timeZone="local"
            locale={ko}
            datesSet={(arg) => {
              setCalendarRange({
                from: arg.start.toISOString(),
                to: arg.end.toISOString(),
              })
            }}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{ today: "오늘", month: "월", week: "주", day: "일" }}
            height="auto"
            events={calendarEvents}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            eventDisplay="block"
            eventDidMount={(info) => {
              info.el.style.cursor = "pointer"
            }}
            eventClick={(info) => {
              router.push(`/admin/events/${info.event.id}`)
            }}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="relative px-4 py-3">
                  <Link
                    href={`/admin/events/${item.id}`}
                    aria-label={`${item.title} 상세 보기`}
                    className="absolute inset-0 z-10 rounded-md"
                  />

                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {item.startsAt === item.endsAt
                        ? format(new Date(item.startsAt), "yyyy.MM.dd HH:mm", {
                            locale: ko,
                          })
                        : `${format(new Date(item.startsAt), "yyyy.MM.dd HH:mm", { locale: ko })} ~ ${format(new Date(item.endsAt), "yyyy.MM.dd HH:mm", { locale: ko })}`}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {item.isPublished ? "공개" : "비공개"} ·{" "}
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </section>
  )
}
