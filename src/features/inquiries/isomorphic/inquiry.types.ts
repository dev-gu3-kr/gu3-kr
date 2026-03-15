export type InquiryStatusDto = "RECEIVED" | "IN_PROGRESS" | "DONE"

export type InquiryStatusFilterDto = "all" | InquiryStatusDto

export type InquiryTypeDto =
  | "MASS_SACRAMENT"
  | "CATECHUMEN_CLASS"
  | "FAITH_PARISH_LIFE"
  | "FACILITY_RENTAL"
  | "WEBSITE_ONLINE"
  | "VOLUNTEER_DONATION"
  | "OTHER"

export type InquiryTypeFilterDto = "all" | InquiryTypeDto

export type InquiryListItemDto = {
  id: string
  title: string | null
  inquiryType: InquiryTypeDto
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
  title: string | null
  inquiryType: InquiryTypeDto
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
