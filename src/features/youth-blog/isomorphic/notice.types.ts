export type CreateNoticeInputDto = {
  title: string
  summary?: string
  content: string
  isPublished?: boolean
}

export type NoticePublishFilterDto = "all" | "published" | "draft"

export type NoticeListItemDto = {
  id: string
  title: string
  summary: string | null
  content: string
  isPublished: boolean
  createdAt: string | Date
}

export type NoticeDetailDto = {
  id: string
  title: string
  summary: string | null
  content: string
  isPublished: boolean
  createdAt: string
}

export type NoticePageDto = {
  items: NoticeListItemDto[]
  nextCursor: string | null
}

export type ApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T
