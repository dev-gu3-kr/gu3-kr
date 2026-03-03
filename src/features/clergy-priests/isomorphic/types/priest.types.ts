// 신부님 작성/수정 요청 DTO다.
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

// 신부님 목록 아이템 DTO다.
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
  createdAt: string
}

// 신부님 상세 DTO다.
export type PriestDetailDto = PriestListItemDto & {
  phone: string | null
}

// 신부님 페이지네이션 DTO다.
export type PriestPageDto = {
  items: PriestListItemDto[]
  nextCursor: string | null
}
