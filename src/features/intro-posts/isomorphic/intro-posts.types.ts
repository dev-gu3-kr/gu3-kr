// 소개 게시글이 속할 수 있는 화면 구분 키
export const INTRO_POST_SECTIONS = ["community", "youth"] as const

// 소개 게시글 화면 구분 타입
export type IntroPostSectionKey = (typeof INTRO_POST_SECTIONS)[number]

// Post.category 에 저장할 소개 게시글 카테고리
export type IntroPostCategory = "COMMUNITY_INTRO" | "YOUTH_INTRO"

// 화면별 경로/문구를 한곳에 모아 둔 설정 타입
export type IntroPostSectionConfig = {
  category: IntroPostCategory // Post.category enum 매핑값
  adminPath: string // 관리자 목록/작성/수정 기본 경로
  adminApiPath: string // 관리자 CRUD API 기본 경로
  publicPath: string // 공개 소개 페이지 경로
  publicApiPath: string // 공개 목록 API 경로
  menuLabel: string // 관리자 메뉴/화면 제목에 사용할 라벨
  publicSectionLabel: string // SubLanding 섹션 라벨
  publicCurrentLabel: string // SubLanding 현재 페이지 라벨
  publicPageTitle: string // 공개 페이지 본문 제목
  adminEmptyMessage: string // 관리자 목록 빈 상태 문구
  publicEmptyMessage: string // 공개 페이지 빈 상태 문구
}

// 공동체/청소년 소개 화면별 라우팅과 문구 설정
export const INTRO_POST_SECTION_CONFIG: Record<
  IntroPostSectionKey,
  IntroPostSectionConfig
> = {
  community: {
    category: "COMMUNITY_INTRO",
    adminPath: "/admin/community/about",
    adminApiPath: "/api/admin/community/about",
    publicPath: "/community/about",
    publicApiPath: "/api/community/about",
    menuLabel: "공동체 마당 소개",
    publicSectionLabel: "공동체 마당",
    publicCurrentLabel: "공동체 마당 소개",
    publicPageTitle: "공동체 마당 소개",
    adminEmptyMessage: "등록된 공동체 마당 소개가 없습니다.",
    publicEmptyMessage: "등록된 공동체 마당 소개가 없습니다.",
  },
  youth: {
    category: "YOUTH_INTRO",
    adminPath: "/admin/youth/about",
    adminApiPath: "/api/admin/youth/about",
    publicPath: "/youth/about",
    publicApiPath: "/api/youth/about",
    menuLabel: "청소년 마당 소개",
    publicSectionLabel: "청소년 마당",
    publicCurrentLabel: "청소년 마당 소개",
    publicPageTitle: "청소년 마당 소개",
    adminEmptyMessage: "등록된 청소년 마당 소개가 없습니다.",
    publicEmptyMessage: "등록된 청소년 마당 소개가 없습니다.",
  },
}

// 소개 게시글 섹션 설정 조회 헬퍼
export function getIntroPostSectionConfig(section: IntroPostSectionKey) {
  return INTRO_POST_SECTION_CONFIG[section]
}

// 소개 게시글 작성 페이지 경로 빌더
export function buildIntroPostNewPath(section: IntroPostSectionKey) {
  return `${INTRO_POST_SECTION_CONFIG[section].adminPath}/new`
}

// 소개 게시글 수정 페이지 경로 빌더
export function buildIntroPostEditPath(
  section: IntroPostSectionKey,
  id: string,
) {
  return `${INTRO_POST_SECTION_CONFIG[section].adminPath}/${id}/edit`
}

// 소개 게시글 생성/수정 요청 DTO
export type CreateIntroPostInputDto = {
  title: string // 카드 제목
  imageUrl: string // 대표 이미지 URL
  content: string // 카드 본문(markdown/plain text)
  sortOrder?: number // 낮을수록 먼저 노출되는 정렬 순서
  isPublished?: boolean // 공개 여부
}

// 소개 게시글 목록 아이템 DTO
export type IntroPostListItemDto = {
  id: string // 식별자
  title: string // 카드 제목
  imageUrl: string | null // 대표 이미지 URL(없으면 null)
  content: string // 카드 본문(markdown/plain text)
  sortOrder: number // 낮을수록 먼저 노출되는 정렬 순서
  isPublished: boolean // 공개 여부
  createdAt: string | Date // 생성 시각(ISO datetime 또는 Date)
}

// 소개 게시글 상세 DTO
export type IntroPostDetailDto = {
  id: string // 식별자
  title: string // 카드 제목
  imageUrl: string | null // 대표 이미지 URL(없으면 null)
  content: string // 카드 본문(markdown/plain text)
  sortOrder: number // 낮을수록 먼저 노출되는 정렬 순서
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 소개 게시글 목록 응답 DTO
export type IntroPostListDto = {
  items: IntroPostListItemDto[] // 화면에 노출할 소개 카드 목록
}

// API 공통 응답 DTO
export type ApiResponseDto<T> = {
  ok: boolean // 요청 성공 여부
  message?: string // 사용자 표시용 메시지
} & T
