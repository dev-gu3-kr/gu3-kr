"use client"

import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { format, formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Loader2, Search } from "lucide-react"

import { AppLink as Link } from "@/components/AppLink"
import { InfiniteSentinel } from "@/components/InfiniteSentinel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  EventDeleteButton,
  EventEditFormContainer,
} from "@/features/events/client"
import {
  type EventListItemDto,
  type EventPublishFilterDto,
  useEventDetailQuery,
} from "@/features/events/isomorphic"

type SchedulerModalState = {
  eventId: string
  mode: "detail" | "edit"
} | null

type CalendarEventItem = {
  id: string
  title: string
  start: string
  end: string
  allDay: boolean
  backgroundColor: string
  borderColor: string
  textColor: string
}

type EventManagerViewProps = {
  viewMode: "scheduler" | "list"
  queryInput: string
  status: EventPublishFilterDto
  items: EventListItemDto[]
  isFilterFetching: boolean
  isFetchingNextPage: boolean
  isSchedulerFetching: boolean
  hasNextPage: boolean
  calendarEvents: CalendarEventItem[]
  schedulerModal: SchedulerModalState
  onViewModeChange: (mode: "scheduler" | "list") => void
  onQueryInputChange: (value: string) => void
  onStatusChange: (value: EventPublishFilterDto) => void
  onCalendarRangeChange: (range: { from: string; to: string }) => void
  onSchedulerModalChange: (value: SchedulerModalState) => void
  onLoadMore: () => Promise<void>
}

function SchedulerDetailModal({
  eventId,
  onEdit,
}: {
  eventId: string
  onEdit: () => void
}) {
  const { data: item, isLoading, isError } = useEventDetailQuery(eventId)

  if (isLoading)
    return (
      <div className="h-[320px] animate-pulse rounded-md border bg-neutral-100" />
    )

  if (isError || !item)
    return (
      <p className="text-sm text-red-600">일정 상세를 불러오지 못했습니다.</p>
    )

  const startsAtText = format(new Date(item.startsAt), "yyyy.MM.dd HH:mm", {
    locale: ko,
  })
  const endsAtText = format(new Date(item.endsAt), "yyyy.MM.dd HH:mm", {
    locale: ko,
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          {item.isPublished ? "공개" : "비공개"} ·{" "}
          {formatDistanceToNow(new Date(item.createdAt), {
            addSuffix: true,
            locale: ko,
          })}
        </p>
      </div>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold text-neutral-700">기간</h4>
        <p className="text-sm text-neutral-600">
          {item.startsAt === item.endsAt
            ? startsAtText
            : `${startsAtText} ~ ${endsAtText}`}
        </p>
      </section>

      <section className="space-y-1">
        <h4 className="text-sm font-semibold text-neutral-700">내용</h4>
        <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
          {item.description || "내용 없음"}
        </p>
      </section>

      <section className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
        >
          수정
        </button>
        <EventDeleteButton eventId={item.id} />
      </section>
    </div>
  )
}

export function EventManagerView({
  viewMode,
  queryInput,
  status,
  items,
  isFilterFetching,
  isFetchingNextPage,
  isSchedulerFetching,
  hasNextPage,
  calendarEvents,
  schedulerModal,
  onViewModeChange,
  onQueryInputChange,
  onStatusChange,
  onCalendarRangeChange,
  onSchedulerModalChange,
  onLoadMore,
}: EventManagerViewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-md border p-1">
          <button
            type="button"
            onClick={() => onViewModeChange("scheduler")}
            className={
              viewMode === "scheduler"
                ? "cursor-pointer rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            }
          >
            스케줄러
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={
              viewMode === "list"
                ? "cursor-pointer rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white"
                : "cursor-pointer rounded-md px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50"
            }
          >
            리스트
          </button>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex min-w-[92px] items-center justify-center whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </div>

      <section className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(value) => {
              if (value === "all" || value === "published" || value === "draft")
                onStatusChange(value)
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="all" aria-label="전체">
              전체
            </ToggleGroupItem>
            <ToggleGroupItem value="published" aria-label="공개">
              공개
            </ToggleGroupItem>
            <ToggleGroupItem value="draft" aria-label="비공개">
              비공개
            </ToggleGroupItem>
          </ToggleGroup>

          {isFilterFetching || isFetchingNextPage || isSchedulerFetching ? (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-500 sm:hidden">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> 불러오는 중
            </p>
          ) : null}
        </div>

        <div className="relative sm:max-w-sm sm:flex-1">
          <input
            value={queryInput}
            onChange={(event) => onQueryInputChange(event.target.value)}
            placeholder="검색"
            className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </section>

      {viewMode === "scheduler" ? (
        <div className="event-scheduler">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            timeZone="local"
            locale={ko}
            datesSet={(arg) =>
              onCalendarRangeChange({
                from: arg.start.toISOString(),
                to: arg.end.toISOString(),
              })
            }
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{ today: "오늘", month: "월", week: "주", day: "일" }}
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
            eventClick={(info) =>
              onSchedulerModalChange({
                eventId: String(info.event.id),
                mode: "detail",
              })
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="relative px-4 py-3">
                  <Link
                    href={`/admin/events/${item.id}`}
                    aria-label={`${item.title} 상세 보기`}
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
                      {item.isPublished ? "공개" : "비공개"} ·{" "}
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

      {viewMode === "list" ? (
        <InfiniteSentinel
          hasMore={Boolean(hasNextPage)}
          onLoadMore={onLoadMore}
          disabled={isFetchingNextPage}
        />
      ) : null}

      <Dialog
        open={Boolean(schedulerModal)}
        onOpenChange={(open) => {
          if (!open) onSchedulerModalChange(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-visible">
          <DialogTitle>일정</DialogTitle>
          {schedulerModal ? (
            schedulerModal.mode === "detail" ? (
              <SchedulerDetailModal
                eventId={schedulerModal.eventId}
                onEdit={() =>
                  onSchedulerModalChange({
                    eventId: schedulerModal.eventId,
                    mode: "edit",
                  })
                }
              />
            ) : (
              <div className="max-h-[75vh] overflow-y-auto pr-1">
                <EventEditFormContainer eventId={schedulerModal.eventId} />
              </div>
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
