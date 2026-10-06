// 행사 상세의 사진 격자·확대 보기에 전달하는 최소 정보
export type GalleryPhotoDto = {
  id: string // 행사 사진 식별자
  thumbnailUrl: string // 격자용 WebP URL
  displayUrl: string // 확대 보기용 WebP URL
  width: number // 방향 보정된 가로 픽셀
  height: number // 방향 보정된 세로 픽셀
  caption: string | null // 설명이 없으면 null
  altText: string // 입력한 대체 텍스트 또는 행사 제목
}

// 관리자 사진 관리에서 사용하는 표시 정보
export type AdminGalleryPhotoDto = GalleryPhotoDto & {
  status: "PUBLISHED" | "HIDDEN" // 사진 공개 여부
  originalName: string // 원본 파일명
  sortOrder: number // 행사 안의 표시 순서
}

// 행사별 사진 목록의 커서 페이지
export type GalleryPhotoPageDto<T = GalleryPhotoDto> = {
  items: T[] // 현재 페이지 사진
  totalCount: number // 현재 조건에 맞는 전체 사진 수
  nextCursor: string | null // 마지막 정렬값을 포함한 커서이며 마지막이면 null
}

// DB에 보존해 새로고침 후에도 조회 가능한 파일별 작업 상태
export type GalleryUploadItemDto = {
  id: string // 파일별 재시도 식별자(UUID)
  originalName: string // 원본 파일명
  sizeBytes: number // 원본 파일 크기(byte)
  needsFile: boolean // 원본 전송이 끝나지 않아 파일을 다시 선택해야 하면 true
  status:
    | "WAITING"
    | "UPLOADING"
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED" // 전송·변환 상태
  error: string | null // 실패 사유가 없으면 null
  photoId: string | null // 변환 완료 전 또는 사진 삭제 후에는 null
}

// 확대 보기에서 아직 로드하지 않은 사진까지 이동할 수 있는 상세 응답
export type GalleryPhotoDetailDto = {
  item: GalleryPhotoDto // 현재 사진
  previousId: string | null // 첫 사진이면 null
  nextId: string | null // 마지막 사진이면 null
  position: number // 행사 내 공개 사진 위치(1부터 시작)
  totalCount: number // 공개 사진 전체 수
}
