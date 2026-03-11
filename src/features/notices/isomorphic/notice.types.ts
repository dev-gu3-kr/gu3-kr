// 공지 생성/수정 요청 DTO
export type CreateNoticeInputDto = {
  title: string // 공지 제목
  summary?: string // 목록 노출용 요약(미입력 가능)
  content: string // 에디터 본문 HTML
  isPublished?: boolean // 공개 여부(미전달 시 서버 기본값 사용)
  isPinned?: boolean // 공지 상단 고정 여부
}

// 공지 공개 상태 필터 DTO
export type NoticePublishFilterDto = "all" | "published" | "draft"

// 공지 목록 아이템 DTO
export type NoticeListItemDto = {
  id: string // 식별자
  title: string // 공지 제목
  summary: string | null // 요약(없으면 null)
  content: string // 본문 HTML
  isPublished: boolean // 공개 여부
  isPinned: boolean // 상단 고정 여부
  createdAt: string | Date // 생성 시각(ISO 문자열 또는 Date 객체)
}

// 공지 상세 DTO
export type NoticeDetailDto = {
  id: string // 식별자
  title: string // 공지 제목
  summary: string | null // 요약(없으면 null)
  content: string // 본문 HTML
  isPublished: boolean // 공개 여부
  isPinned: boolean // 상단 고정 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 공지 커서 기반 페이지 DTO
export type NoticePageDto = {
  items: NoticeListItemDto[] // 현재 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시용 메시지(선택)
} & T
