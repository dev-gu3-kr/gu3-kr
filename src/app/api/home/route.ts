import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { NextResponse } from "next/server"
import type {
  HomeBoardColumn,
  HomeEventCard,
  HomePageResponseDto,
  HomeSchedulerItem,
} from "@/features/home/isomorphic"
import { noticeService as noticeServicePublic } from "@/features/notices/server"
import { noticeService as youthBlogService } from "@/features/youth-blog/server"
import { prisma } from "@/lib/prisma"

const EVENT_CARD_ACCENTS = [
  "from-[#ccb28c] via-[#8c5b34] to-[#3a2419]",
  "from-[#d8d4cf] via-[#8d735b] to-[#463328]",
  "from-[#d7c7c2] via-[#90737a] to-[#3c2c33]",
  "from-[#c0c7d8] via-[#6b7ca0] to-[#27324d]",
] as const

function getMonthRange(baseDate: Date) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const end = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  )
  return { start, end }
}

function buildSchedulerItems(
  events: Array<{ title: string; startsAt: Date }>,
  baseDate: Date,
) {
  const items: HomeSchedulerItem[] = []
  const limit = 9

  for (let offset = 0; offset < limit; offset += 1) {
    const date = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      offset + 1,
    )
    const eventTitles = events
      .filter((event) => event.startsAt.getDate() === date.getDate())
      .slice(0, 2)
      .map((event) => event.title)

    items.push({
      dayLabel: format(date, "EEE", { locale: ko }).slice(0, 1),
      dayNumber: date.getDate(),
      isActive: date.getDate() === baseDate.getDate(),
      events: eventTitles,
    })
  }

  return items
}

function mapBoardColumn(
  title: string,
  items: Array<{ id: string; title: string; createdAt: Date | string }>,
): HomeBoardColumn {
  return {
    title,
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
  }>,
): HomeEventCard[] {
  return items.map((item, index) => ({
    title: item.title,
    description:
      item.content?.trim().slice(0, 40) ||
      "본당의 다양한 행사 소식을 준비하고 있습니다.",
    accentClassName: EVENT_CARD_ACCENTS[index % EVENT_CARD_ACCENTS.length],
    thumbnailUrl: item.thumbnailUrl ?? null,
  }))
}

export async function GET() {
  const now = new Date()
  const { start, end } = getMonthRange(now)

  const [noticesPage, youthBlogPage, bulletinRows, galleryRows, monthEvents] =
    await Promise.all([
      noticeServicePublic.getNoticePage({ take: 5, isPublished: true }),
      youthBlogService.getYouthBlogPage({ take: 5, isPublished: true }),
      prisma.post.findMany({
        where: { category: "BULLETIN", isPublished: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5,
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.post.findMany({
        where: { category: "GALLERY", isPublished: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 4,
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          galleryImages: {
            orderBy: [
              { isCover: "desc" },
              { sortOrder: "asc" },
              { createdAt: "asc" },
            ],
            take: 1,
            select: { url: true },
          },
        },
      }),
      prisma.event.findMany({
        where: {
          isPublished: true,
          startsAt: { gte: start, lte: end },
        },
        orderBy: [{ startsAt: "asc" }, { id: "desc" }],
        select: { title: true, startsAt: true },
      }),
    ])

  const response: HomePageResponseDto = {
    ok: true,
    schedulerMonthLabel: format(now, "yyyy년 M월", { locale: ko }),
    schedulerItems: buildSchedulerItems(monthEvents, now),
    eventCards: mapEventCards(
      galleryRows.map((row) => ({
        ...row,
        thumbnailUrl: row.galleryImages[0]?.url ?? null,
      })),
    ),
    boardColumns: [
      mapBoardColumn("공지사항", noticesPage.items),
      mapBoardColumn("청소년 블로그", youthBlogPage.items),
      mapBoardColumn("본당 주보", bulletinRows),
    ],
  }

  return NextResponse.json(response)
}
