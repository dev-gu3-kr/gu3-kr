// 일정 생성/수정 요청 DTO
export type CreateEventInputDto = {
  title: string // 일정 제목
  description: string // 일정 설명/본문
  startsAt: string // 시작 일시(ISO datetime)
  endsAt: string // 종료 일시(ISO datetime)
  isPublished?: boolean // 공개 여부(선택)
}

// 일정 공개 상태 필터 DTO
export type EventPublishFilterDto = "all" | "published" | "draft"

// 일정 목록 아이템 DTO
export type EventListItemDto = {
  id: string // 식별자
  title: string // 일정 제목
  description: string | null // 일정 설명(없으면 null)
  startsAt: string // 시작 일시(ISO datetime)
  endsAt: string // 종료 일시(ISO datetime)
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 일정 상세 DTO
export type EventDetailDto = {
  id: string // 식별자
  title: string // 일정 제목
  description: string | null // 일정 설명(없으면 null)
  startsAt: string // 시작 일시(ISO datetime)
  endsAt: string // 종료 일시(ISO datetime)
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 일정 커서 기반 페이지 DTO
export type EventPageDto = {
  items: EventListItemDto[] // 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시 메시지(선택)
} & T
