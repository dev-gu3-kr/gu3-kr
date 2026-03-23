// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시용 메시지(선택)
} & T

// 갤러리 이미지 DTO
export type GalleryImageDto = {
  id: string // 이미지 식별자
  originalName: string // 업로드 당시 원본 파일명
  url: string // 공개 접근 가능한 이미지 URL
}

// 갤러리 목록 아이템 DTO
export type GalleryListItemDto = {
  id: string // 식별자
  title: string // 갤러리 제목
  isPublished: boolean // 공개 여부
  createdAt: string | Date // 생성 시각(ISO 문자열 또는 Date 객체)
  thumbnailUrl: string | null // 대표 이미지 URL(없으면 null)
  hasYoutube: boolean // 유튜브 배지 노출 여부
}

// 갤러리 상세 DTO
export type GalleryDetailDto = {
  id: string // 식별자
  title: string // 갤러리 제목
  content: string // 본문 마크다운/HTML 문자열
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
  galleryImages: GalleryImageDto[] // 대표 이미지 목록
  youtubeUrl: string | null // 본문에서 추출한 유튜브 URL(없으면 null)
  hasYoutube: boolean // 유튜브 배지 노출 여부
}

// 갤러리 커서 기반 페이지 DTO
export type GalleryPageDto = {
  items: GalleryListItemDto[] // 현재 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}

// 공개 갤러리 목록 페이지 DTO
export type GalleryPublicPageDto = {
  items: GalleryListItemDto[] // 현재 페이지 아이템
  totalCount: number // 검색 조건 기준 전체 개수
  totalPages: number // 전체 페이지 수
  currentPage: number // 현재 페이지 번호(1-base)
  pageSize: number // 한 페이지 노출 개수
}

// 공개 갤러리 이전/다음 글 이동용 DTO
export type GalleryNavigationItemDto = {
  id: string // 이동 대상 게시글 식별자
  title: string // 이동 대상 게시글 제목
}

// 공개 갤러리 하단 네비게이션 DTO
export type GalleryNavigationDto = {
  prev: GalleryNavigationItemDto | null // 시간상 이전 글(목록 아래 방향)
  next: GalleryNavigationItemDto | null // 시간상 다음 글(목록 위 방향)
}
