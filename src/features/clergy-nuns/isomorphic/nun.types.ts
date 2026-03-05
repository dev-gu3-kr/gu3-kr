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
  createdAt: string
}

export type NunDetailDto = NunListItemDto & {
  phone: string | null
}

export type NunPageDto = {
  items: NunListItemDto[]
  nextCursor: string | null
}
