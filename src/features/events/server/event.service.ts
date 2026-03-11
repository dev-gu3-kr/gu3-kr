import {
  createEventRecord,
  deleteEventById,
  findEventById,
  findEventPageRows,
  updateEventById,
} from "./event.query"

export async function getEventPage(params: {
  take: number
  cursor?: string
  query?: string
  status?: string | null
  from?: string | null
  to?: string | null
}) {
  const rows = await findEventPageRows(params)
  const hasMore = rows.length > params.take
  const items = hasMore ? rows.slice(0, params.take) : rows

  return {
    items,
    pageInfo: {
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : null,
      take: params.take,
    },
  }
}

export async function createEvent(input: {
  title: string
  description: string
  startsAtText: string
  endsAtText: string
  isPublished: boolean
  createdById: string
}) {
  const title = input.title.trim()
  const description = input.description.trim()
  const startsAt = new Date(input.startsAtText)
  const endsAt = new Date(input.endsAtText)

  if (!title || !description) {
    return { error: "제목/내용/시작/종료는 필수입니다." as const }
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "일정 날짜 형식이 올바르지 않습니다." as const }
  }
  if (endsAt < startsAt) {
    return { error: "종료일은 시작일보다 빠를 수 없습니다." as const }
  }

  const created = await createEventRecord({
    title,
    description,
    startsAt,
    endsAt,
    isPublished: input.isPublished,
    createdById: input.createdById,
  })

  return { created }
}

export async function getEventById(id: string) {
  return findEventById(id)
}

export async function updateEvent(input: {
  id: string
  title: string
  description: string
  startsAtText: string
  endsAtText: string
  isPublished: boolean
}) {
  const target = await findEventById(input.id)
  if (!target) return { notFound: true as const }

  const title = input.title.trim()
  const description = input.description.trim()
  const startsAt = new Date(input.startsAtText)
  const endsAt = new Date(input.endsAtText)

  if (!title || !description) {
    return { error: "제목/내용/시작/종료는 필수입니다." as const }
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "일정 날짜 형식이 올바르지 않습니다." as const }
  }
  if (endsAt < startsAt) {
    return { error: "종료일은 시작일보다 빠를 수 없습니다." as const }
  }

  await updateEventById(input.id, {
    title,
    description,
    startsAt,
    endsAt,
    isPublished: input.isPublished,
  })

  return { ok: true as const }
}

export async function removeEvent(id: string) {
  const target = await findEventById(id)
  if (!target) return { notFound: true as const }

  await deleteEventById(id)
  return { ok: true as const }
}
