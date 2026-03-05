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

export type PriestDetailDto = PriestListItemDto & {
  phone: string | null
}

export type PriestPageDto = {
  items: PriestListItemDto[]
  nextCursor: string | null
}
