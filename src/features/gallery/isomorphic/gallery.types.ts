export type ApiResponseDto<T> = {
  ok: boolean
  message?: string
} & T

// 갤러리 목록 아이템 DTO
export type GalleryListItemDto = {
  id: string
  title: string
  isPublished: boolean
  createdAt: string | Date
  thumbnailUrl: string | null
  hasYoutube: boolean
}

export type GalleryPageDto = {
  items: GalleryListItemDto[]
  nextCursor: string | null
}

export type GalleryPublicPageDto = {
  items: GalleryListItemDto[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}
