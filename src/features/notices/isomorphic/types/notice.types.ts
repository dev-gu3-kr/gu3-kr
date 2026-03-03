// 공지 작성 입력 DTO 타입이다.
export type CreateNoticeInputDto = {
  // 공지 제목
  title: string
  // 공지 요약(선택)
  summary?: string
  // 공지 본문
  content: string
  // 즉시 공개 여부
  isPublished?: boolean
}

// 공지 목록 아이템 DTO 타입이다.
export type NoticeListItemDto = {
  id: string
  title: string
  summary: string | null
  isPublished: boolean
  createdAt: string | Date
}

// 공지 상세 DTO 타입이다.
export type NoticeDetailDto = {
  id: string
  title: string
  summary: string | null
  content: string
  isPublished: boolean
  createdAt: string
}

// 공지 목록 페이지 DTO 타입이다.
export type NoticePageDto = {
  items: NoticeListItemDto[]
  nextCursor: string | null
}

// API 공통 응답 DTO 타입이다.
export type ApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T
