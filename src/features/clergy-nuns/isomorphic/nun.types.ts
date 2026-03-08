// 수녀님 생성/수정 입력 DTO
export type UpsertNunInputDto = {
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

// 수녀님 목록 카드/상세에 공통으로 쓰는 공개 DTO
export type NunListItemDto = {
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

// 수녀님 목록 페이지 응답 DTO
export type NunPageDto = {
  items: NunListItemDto[]
  nextCursor: string | null
}

// 수녀님 단건 상세 DTO
export type NunDetailDto = NunListItemDto

// 수녀님 API 공통 응답 DTO
export type NunApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T
