// 갤러리 목록 아이템 DTO
export type GalleryListItemDto = {
  id: string // 식별자
  title: string // 제목
  isPublished: boolean // 공개 여부
  createdAt: string // 생성 시각
  thumbnailUrl: string | null // 대표 썸네일 URL
  hasYoutube: boolean // YouTube 링크 포함 여부
}

// 갤러리 커서 페이지 DTO
export type GalleryPageDto = {
  items: GalleryListItemDto[] // 페이지 아이템
  nextCursor: string | null // 다음 페이지 커서
}
