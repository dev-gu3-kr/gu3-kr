// 신부님 생성/수정 입력 DTO
export type UpsertPriestInputDto = {
  name: string
  baptismalName?: string
  duty: string
  feastMonth?: number
  feastDay?: number
  termStart?: string
  termEnd?: string
  phone?: string
  imageUrl?: string
  isCurrent?: boolean
  sortOrder?: number
}

// 신부님 목록 카드/상세에 공통으로 쓰는 공개 DTO
export type PriestListItemDto = {
  id: string
  name: string
  baptismalName: string | null
  duty: string
  feastMonth: number | null
  feastDay: number | null
  termStart: string | null
  termEnd: string | null
  isCurrent: boolean
  sortOrder: number
  imageUrl: string | null
  phone: string | null
  createdAt: string
}

// 신부님 목록 페이지 응답 DTO
export type PriestPageDto = {
  items: PriestListItemDto[]
  nextCursor: string | null
}

// 신부님 단건 상세 DTO
export type PriestDetailDto = PriestListItemDto

// 신부님 API 공통 응답 DTO
export type PriestApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T
