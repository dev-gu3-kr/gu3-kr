"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  type EventPublishFilterDto,
  useEventListInfinite,
  useEventSchedulerQuery,
} from "@/features/events/isomorphic"
import { useEventManagerViewMode } from "../EventManagerViewModeContext"
import { EventManagerView } from "./EventManagerView"

export function EventManagerContainer() {
  const { viewMode, setViewMode } = useEventManagerViewMode()

  const [queryInput, setQueryInput] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<EventPublishFilterDto>("all")
  const [calendarRange, setCalendarRange] = useState<{
    from: string
    to: string
  } | null>(null)
  const [schedulerModal, setSchedulerModal] = useState<{
    eventId: string
    mode: "detail" | "edit"
  } | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(queryInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [queryInput])

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useEventListInfinite({ filters: { query, status } })

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

  const handleLoadMore = useCallback(async () => {
    await fetchNextPage()
  }, [fetchNextPage])

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
    <EventManagerView
      viewMode={viewMode}
      queryInput={queryInput}
      status={status}
      items={items}
      isFilterFetching={isFilterFetching}
      isFetchingNextPage={isFetchingNextPage}
      isSchedulerFetching={isSchedulerFetching}
      hasNextPage={Boolean(hasNextPage)}
      calendarEvents={calendarEvents}
      schedulerModal={schedulerModal}
      onViewModeChange={setViewMode}
      onQueryInputChange={setQueryInput}
      onStatusChange={setStatus}
      onCalendarRangeChange={setCalendarRange}
      onSchedulerModalChange={setSchedulerModal}
      onLoadMore={handleLoadMore}
    />
  )
}
