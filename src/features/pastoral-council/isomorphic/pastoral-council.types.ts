export type UpsertPastoralCouncilInputDto = {
  name: string
  baptismalName?: string
  duty: string
  phone: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}

export type PastoralCouncilListItemDto = {
  id: string
  name: string
  baptismalName: string | null
  duty: string
  phone: string
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

export type PastoralCouncilDetailDto = PastoralCouncilListItemDto

export type PastoralCouncilPageDto = {
  items: PastoralCouncilListItemDto[]
  nextCursor: string | null
}
