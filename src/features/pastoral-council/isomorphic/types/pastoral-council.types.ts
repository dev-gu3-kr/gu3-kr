// 사목협의회 생성/수정 요청 DTO
export type UpsertPastoralCouncilInputDto = {
  name: string // 이름(필수)
  baptismalName?: string // 세례명(선택)
  duty: string // 담당영역/직무(필수)
  phone: string // 연락처(필수)
  imageUrl?: string // 프로필 이미지 URL(선택)
  sortOrder?: number // 정렬 우선순위(선택)
  isActive?: boolean // 활성 여부(선택, 기본 true)
}

// 사목협의회 목록 아이템 DTO
export type PastoralCouncilListItemDto = {
  id: string // 식별자
  name: string // 이름
  baptismalName: string | null // 세례명
  duty: string // 담당영역
  phone: string // 연락처
  imageUrl: string | null // 프로필 이미지 URL
  sortOrder: number // 정렬 우선순위
  isActive: boolean // 활성 여부
  createdAt: string // 생성 시각(ISO datetime)
}

// 사목협의회 상세 DTO
export type PastoralCouncilDetailDto = PastoralCouncilListItemDto

// 사목협의회 커서 기반 페이지 DTO
export type PastoralCouncilPageDto = {
  items: PastoralCouncilListItemDto[] // 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서
}
