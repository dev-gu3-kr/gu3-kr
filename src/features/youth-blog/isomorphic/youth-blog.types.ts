// 청소년 블로그 생성/수정 요청 DTO
export type CreateYouthBlogInputDto = {
  title: string // 게시글 제목
  thumbnailUrl: string // 대표 썸네일 URL
  content: string // 에디터 본문 markdown
  isPublished?: boolean // 공개 여부(선택)
}

// 청소년 블로그 공개 상태 필터 DTO
export type YouthBlogPublishFilterDto = "all" | "published" | "draft"

// 청소년 블로그 목록 아이템 DTO
export type YouthBlogListItemDto = {
  id: string // 식별자
  title: string // 게시글 제목
  thumbnailUrl: string | null // 대표 썸네일 URL(없으면 null)
  content: string // 본문 markdown
  isPublished: boolean // 공개 여부
  createdAt: string | Date // 생성 시각(ISO 문자열 또는 Date 객체)
}

// 청소년 블로그 상세 DTO
export type YouthBlogDetailDto = {
  id: string // 식별자
  title: string // 게시글 제목
  thumbnailUrl: string | null // 대표 썸네일 URL(없으면 null)
  content: string // 본문 markdown
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 청소년 블로그 커서 기반 페이지 DTO
export type YouthBlogPageDto = {
  items: YouthBlogListItemDto[] // 현재 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시용 메시지(선택)
} & T

// 공개 청소년 블로그 목록 페이지 DTO
export type YouthBlogPublicPageDto = {
  items: YouthBlogListItemDto[] // 현재 페이지 아이템
  totalCount: number // 검색 조건 기준 전체 개수
  totalPages: number // 전체 페이지 수
  currentPage: number // 현재 페이지 번호(1-base)
  pageSize: number // 한 페이지 노출 개수
}

// 공개 청소년 블로그 이전/다음 글 이동용 DTO
export type YouthBlogNavigationItemDto = {
  id: string // 이동 대상 게시글 식별자
  title: string // 이동 대상 게시글 제목
}

// 공개 청소년 블로그 하단 네비게이션 DTO
export type YouthBlogNavigationDto = {
  prev: YouthBlogNavigationItemDto | null // 시간상 이전 글(목록 아래 방향)
  next: YouthBlogNavigationItemDto | null // 시간상 다음 글(목록 위 방향)
}
