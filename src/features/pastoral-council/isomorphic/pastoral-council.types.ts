// 사목협의회 생성/수정 요청 DTO
export type UpsertPastoralCouncilInputDto = {
  name: string // 이름
  baptismalName?: string // 세례명(미입력 가능)
  duty: string // 직책
  phone: string // 연락처
  imageUrl?: string // 프로필 이미지 URL(미입력 가능)
  sortOrder?: number // 목록 노출 순서(미입력 시 서버 기본값 사용)
  isActive?: boolean // 노출 활성 상태(선택)
}

// 사목협의회 목록 아이템 DTO
export type PastoralCouncilListItemDto = {
  id: string // 식별자
  name: string // 이름
  baptismalName: string | null // 세례명(없으면 null)
  duty: string // 직책
  phone: string // 연락처
  imageUrl: string | null // 프로필 이미지 URL(없으면 null)
  sortOrder: number // 목록 정렬 순서
  isActive: boolean // 활성/비활성 상태
  createdAt: string // 생성 시각(ISO datetime)
}

// 사목협의회 상세 DTO
export type PastoralCouncilDetailDto = PastoralCouncilListItemDto

// 사목협의회 커서 기반 페이지 DTO
export type PastoralCouncilPageDto = {
  items: PastoralCouncilListItemDto[] // 현재 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}
