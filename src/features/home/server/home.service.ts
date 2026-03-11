import { format } from "date-fns"
import { ko } from "date-fns/locale"
import type {
  HomeBoardColumn,
  HomeEventCard,
  HomePageResponseDto,
  HomeSchedulerItem,
} from "@/features/home/isomorphic"
import { noticeService as noticeServicePublic } from "@/features/notices/server"
import { noticeService as youthBlogService } from "@/features/youth-blog/server"
import {
  findPublishedBulletinsForHome,
  findPublishedEventsByRange,
  findPublishedGalleriesForHome,
} from "./home.query"

const EVENT_CARD_ACCENTS = [
  "from-[#ccb28c] via-[#8c5b34] to-[#3a2419]",
  "from-[#d8d4cf] via-[#8d735b] to-[#463328]",
  "from-[#d7c7c2] via-[#90737a] to-[#3c2c33]",
  "from-[#c0c7d8] via-[#6b7ca0] to-[#27324d]",
] as const

function resolveBaseDate(monthParam: string | null, now: Date) {
  if (!monthParam) return now
  const matched = /^(\d{4})-(\d{2})$/.exec(monthParam)
  if (!matched) return now

  const year = Number(matched[1])
  const monthIndex = Number(matched[2]) - 1
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) return now
  if (monthIndex < 0 || monthIndex > 11) return now

  return new Date(year, monthIndex, 1)
}

function formatMonthKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  return `${date.getFullYear()}-${month}`
}

function getThreeMonthRange(baseDate: Date) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1)
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 2,
    0,
    23,
    59,
    59,
    999,
  )
  return { start, end }
}

function buildSchedulerItems(
  events: Array<{
    title: string
    description: string | null
    startsAt: Date
    endsAt: Date
  }>,
  monthDate: Date,
  today: Date,
) {
  const items: HomeSchedulerItem[] = []
  const lastDate = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate()
  const isCurrentMonth =
    monthDate.getFullYear() === today.getFullYear() &&
    monthDate.getMonth() === today.getMonth()

  for (let offset = 0; offset < lastDate; offset += 1) {
    const date = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      offset + 1,
    )
    const dayStart = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      offset + 1,
      0,
      0,
      0,
      0,
    )
    const dayEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      offset + 1,
      23,
      59,
      59,
      999,
    )

    const eventTitles = events
      .filter((event) => event.startsAt <= dayEnd && event.endsAt >= dayStart)
      .map((event) => ({
        title: event.title,
        description: event.description ?? "",
      }))

    items.push({
      dateIso: date.toISOString(),
      dayLabel: format(date, "EEE", { locale: ko }).slice(0, 1),
      dayNumber: date.getDate(),
      isActive: isCurrentMonth && date.getDate() === today.getDate(),
      events: eventTitles,
    })
  }

  return items
}

function mapBoardColumn(
  title: string,
  items: Array<{ id: string; title: string; createdAt: Date | string }>,
): HomeBoardColumn {
  const hrefByTitle: Record<string, string> = {
    공지사항: "/notice/notices",
    "청소년 블로그": "/youth/blog",
    "본당 주보": "/notice/weekly-bulletin",
  }

  return {
    title,
    href: hrefByTitle[title],
    items: items.map((item) => ({
      title: item.title,
      date: format(new Date(item.createdAt), "yyyy/MM/dd"),
    })),
  }
}

function mapEventCards(
  items: Array<{
    title: string
    createdAt: Date
    content?: string | null
    thumbnailUrl?: string | null
    hasYoutube?: boolean
  }>,
): HomeEventCard[] {
  return items.map((item, index) => ({
    title: item.title,
    description:
      item.content?.trim().slice(0, 40) ||
      "본당의 다양한 행사 소식을 준비하고 있습니다.",
    accentClassName: EVENT_CARD_ACCENTS[index % EVENT_CARD_ACCENTS.length],
    thumbnailUrl: item.thumbnailUrl ?? null,
    hasYoutube: Boolean(item.hasYoutube),
  }))
}

export async function getHomePage(monthParam: string | null) {
  const now = new Date()
  const baseDate = resolveBaseDate(monthParam, now)
  const { start, end } = getThreeMonthRange(baseDate)

  const [noticesPage, youthBlogPage, bulletinRows, galleryRows, monthEvents] =
    await Promise.all([
      noticeServicePublic.getNoticePage({ take: 5, isPublished: true }),
      youthBlogService.getYouthBlogPage({ take: 5, isPublished: true }),
      findPublishedBulletinsForHome(5),
      findPublishedGalleriesForHome(8),
      findPublishedEventsByRange({ start, end }),
    ])

  const monthDates = [-1, 0, 1].map(
    (offset) =>
      new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1),
  )

  const schedulerByMonth = Object.fromEntries(
    monthDates.map((monthDate) => {
      const monthKey = formatMonthKey(monthDate)
      return [
        monthKey,
        {
          schedulerMonthLabel: format(monthDate, "yyyy년 M월", { locale: ko }),
          schedulerItems: buildSchedulerItems(monthEvents, monthDate, now),
        },
      ]
    }),
  )

  const baseMonthKey = formatMonthKey(baseDate)

  const response: HomePageResponseDto = {
    ok: true,
    schedulerMonthLabel: schedulerByMonth[baseMonthKey].schedulerMonthLabel,
    schedulerItems: schedulerByMonth[baseMonthKey].schedulerItems,
    schedulerByMonth,
    eventCards: mapEventCards(
      galleryRows.map((row) => ({
        ...row,
        thumbnailUrl: row.galleryImages[0]?.url ?? null,
        hasYoutube: Boolean(row.youtubeUrl),
      })),
    ),
    boardColumns: [
      mapBoardColumn("공지사항", noticesPage.items),
      mapBoardColumn("청소년 블로그", youthBlogPage.items),
      mapBoardColumn("본당 주보", bulletinRows),
    ],
  }

  return response
}
