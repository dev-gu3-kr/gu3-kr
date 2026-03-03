// 신부님 생성/수정 요청 DTO
export type UpsertPriestInputDto = {
  name: string // 이름(필수)
  baptismalName?: string // 세례명(선택)
  duty: string // 담당 영역/직무(필수)
  feastMonth?: number // 축일 월(1~12, 선택)
  feastDay?: number // 축일 일(1~31, 선택)
  termStart?: string // 임기 시작(ISO datetime, 선택)
  termEnd?: string // 임기 종료(ISO datetime, 선택)
  phone?: string // 연락처(선택)
  imageUrl?: string // 프로필 이미지 URL(선택)
  isCurrent?: boolean // 현직 여부(선택, 기본 true)
  sortOrder?: number // 정렬 우선순위(선택)
}

// 신부님 목록 아이템 DTO
export type PriestListItemDto = {
  id: string // 식별자
  name: string // 이름
  baptismalName: string | null // 세례명(미등록 가능)
  duty: string // 담당 영역/직무
  feastMonth: number | null // 축일 월(미등록 가능)
  feastDay: number | null // 축일 일(미등록 가능)
  termStart: string | null // 임기 시작(ISO datetime, 미등록 가능)
  termEnd: string | null // 임기 종료(ISO datetime, 미등록 가능)
  isCurrent: boolean // 현직 여부
  sortOrder: number // 정렬 우선순위
  imageUrl: string | null // 프로필 이미지 URL(미등록 가능)
  createdAt: string // 생성 시각(ISO datetime)
}

// 신부님 상세 DTO
export type PriestDetailDto = PriestListItemDto & {
  phone: string | null // 연락처(미등록 가능)
}

// 신부님 커서 기반 페이지 DTO
export type PriestPageDto = {
  items: PriestListItemDto[] // 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서(없으면 null)
}
