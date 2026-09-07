// 사진 아카이브의 관리자·공개 노출 상태
export type ArchivePhotoStatusDto = "PUBLISHED" | "HIDDEN"

// 관리자 목록의 공개 상태 필터
export type ArchivePhotoAdminFilterDto = "ALL" | ArchivePhotoStatusDto

// 관리자 목록에서 원본을 노출하지 않고 검토에 필요한 정보만 전달한다.
export type AdminArchivePhotoDto = {
  id: string // 사진 고유 식별자
  year: number // 관리자가 확정한 촬영 연도
  status: ArchivePhotoStatusDto // 현재 공개 상태
  sortOrder: number // 같은 연도 안의 표시 순서
  caption: string | null // 확인된 사진 설명이며 없으면 null
  altText: string | null // 관리자가 입력한 대체 텍스트이며 없으면 null
  originalName: string // 등록 당시 원본 파일명
  originalSizeBytes: number // 보존 원본 크기(byte)
  displayUrl: string // 관리자·일반 화면에서 사용할 WebP URL
  width: number // 방향 보정된 표시본 가로 픽셀
  height: number // 방향 보정된 표시본 세로 픽셀
  createdAt: string // 등록 시각(ISO datetime)
}

// 공개 화면에 전달하는 최소 사진 정보
export type PublicArchivePhotoDto = {
  id: string // 공유 URL과 뷰어 이동에 사용하는 식별자
  year: number // 연도 필터와 기본 설명에 사용하는 촬영 연도
  displayUrl: string // 공개 WebP URL
  width: number // 레이아웃 공간을 미리 확보할 가로 픽셀
  height: number // 레이아웃 공간을 미리 확보할 세로 픽셀
  caption: string | null // 확인된 설명이며 없으면 null
  altText: string // 관리자 입력 또는 서버가 만든 기본 대체 텍스트
}

// cursor 기반 사진 목록의 공통 페이지 정보
export type ArchivePhotoPageInfoDto = {
  hasMore: boolean // 다음 페이지 존재 여부
  nextCursor: string | null // 다음 요청에 전달할 사진 ID
}

// 관리자 사진 목록 응답
export type AdminArchivePhotoPageDto = {
  items: AdminArchivePhotoDto[] // 현재 페이지 사진 목록
  pageInfo: ArchivePhotoPageInfoDto // cursor 페이지 정보
  years: number[] // 필터에 사용할 등록 연도 목록
}

// 공개 사진 목록 응답
export type PublicArchivePhotoPageDto = {
  items: PublicArchivePhotoDto[] // 현재 페이지 공개 사진 목록
  pageInfo: ArchivePhotoPageInfoDto // cursor 페이지 정보
  years: number[] // 공개 사진이 존재하는 연도 목록
}

// 다중 선택에서 실행할 수 있는 일괄 작업
export type ArchivePhotoBulkActionDto = "CHANGE_STATUS" | "CHANGE_YEAR"

// API 공통 응답 계약
export type PhotoArchiveApiResponseDto<
  T extends object = Record<string, never>,
> = {
  ok: boolean // 요청 성공 여부
  message?: string // 실패 또는 완료 안내
} & T
