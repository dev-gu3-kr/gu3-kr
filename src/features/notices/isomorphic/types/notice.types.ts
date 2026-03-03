// 공지 생성/수정 요청 DTO
export type CreateNoticeInputDto = {
  title: string // 공지 제목
  summary?: string // 공지 요약(선택)
  content: string // 공지 본문(Toast UI markdown)
  isPublished?: boolean // 즉시 공개 여부(선택)
}

// 공지 공개 상태 필터 DTO
export type NoticePublishFilterDto = "all" | "published" | "draft"

// 공지 목록 아이템 DTO
export type NoticeListItemDto = {
  id: string // 식별자
  title: string // 공지 제목
  summary: string | null // 공지 요약(없으면 null)
  content: string // 공지 본문
  isPublished: boolean // 공개 여부
  createdAt: string | Date // 생성 시각
}

// 공지 상세 DTO
export type NoticeDetailDto = {
  id: string // 식별자
  title: string // 공지 제목
  summary: string | null // 공지 요약(없으면 null)
  content: string // 공지 본문
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 공지 커서 기반 페이지 DTO
export type NoticePageDto = {
  items: NoticeListItemDto[] // 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시 메시지(선택)
} & T
