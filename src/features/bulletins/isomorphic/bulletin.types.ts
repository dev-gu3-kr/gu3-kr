// 본당주보 게시 상태 필터 DTO
export type BulletinPublishFilterDto = "all" | "published" | "draft"

// 본당주보 첨부 파일 DTO
export type BulletinAttachmentDto = {
  id?: string // 관리자 상세에서만 필요한 첨부 식별자(공개 응답에서는 생략 가능)
  originalName: string // 사용자에게 보여줄 원본 파일명
  url: string // 저장소 원본 URL
}

// 관리자 주보 목록 아이템 DTO
export type BulletinListItemDto = {
  id: string // 식별자
  title: string // 주보 제목
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
  attachments: BulletinAttachmentDto[] // 첨부 파일 목록
}

// 관리자 주보 상세 DTO
export type BulletinDetailDto = {
  id: string // 식별자
  title: string // 주보 제목
  content: string // 본문 텍스트
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
  attachments: BulletinAttachmentDto[] // 첨부 파일 목록
}

// 관리자 커서 기반 목록 응답 DTO
export type BulletinPageDto = {
  items: BulletinListItemDto[] // 현재 페이지 아이템
  pageInfo: {
    hasMore: boolean // 다음 페이지 존재 여부
    nextCursor: string | null // 다음 페이지 커서
    take: number // 요청한 페이지 크기
  }
}

// 공개 주보 목록 아이템 DTO
export type BulletinPublicListItemDto = {
  id: string // 식별자
  title: string // 주보 제목
  authorName: string // 작성자 표시 이름
  createdAt: string // 생성 시각(ISO datetime)
  attachments: BulletinAttachmentDto[] // 첨부 파일 목록
}

// 공개 주보 상세 DTO
export type BulletinPublicDetailDto = {
  id: string // 식별자
  title: string // 주보 제목
  content: string // 본문 텍스트
  authorName: string // 작성자 표시 이름
  createdAt: string // 생성 시각(ISO datetime)
  attachments: BulletinAttachmentDto[] // 첨부 파일 목록
}

// 공개 주보 목록 페이지 DTO
export type BulletinPublicPageDto = {
  items: BulletinPublicListItemDto[] // 현재 페이지 아이템
  totalCount: number // 전체 공개 주보 개수
  totalPages: number // 전체 페이지 수
  currentPage: number // 현재 페이지 번호
  pageSize: number // 페이지 크기
}

// 공개 상세 이전/다음 이동 아이템 DTO
export type BulletinNavigationItemDto = {
  id: string // 이동 대상 식별자
  title: string // 이동 대상 제목
}

// 공개 상세 이전/다음 이동 DTO
export type BulletinNavigationDto = {
  prev: BulletinNavigationItemDto | null // 이전 글(더 오래된 글)
  next: BulletinNavigationItemDto | null // 다음 글(더 최신 글)
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시용 메시지
} & T
