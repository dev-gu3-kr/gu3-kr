export type InquiryStatusDto = "RECEIVED" | "IN_PROGRESS" | "DONE"

export type InquiryStatusFilterDto = "all" | InquiryStatusDto

export type InquiryListItemDto = {
  id: string
  title: string
  email: string | null
  phone: string | null
  summary: string
  processingMemo: string | null
  status: InquiryStatusDto
  isPrivate: boolean
  createdAt: string
}

export type InquiryPageDto = {
  items: InquiryListItemDto[]
  nextCursor: string | null
}

export type InquiryDetailDto = {
  id: string
  title: string
  email: string | null
  phone: string | null
  content: string
  status: InquiryStatusDto
  isPrivate: boolean
  createdAt: string
  updatedAt: string
  processedAt: string | null
  processingMemo: string | null
  processedById: string | null
}

export type ApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T
