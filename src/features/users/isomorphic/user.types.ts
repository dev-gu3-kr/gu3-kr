import type { UserRole } from "@prisma/client"

// 관리자 사용자 생성 요청 DTO
export type CreateAdminUserInputDto = {
  displayName: string // 표시 이름
  email: string // 로그인 이메일
  role: UserRole // 권한
  password: string // 초기 비밀번호
  isActive?: boolean // 활성 상태
}

// 관리자 사용자 수정 요청 DTO
export type UpdateAdminUserInputDto = {
  displayName?: string // 표시 이름
  email?: string | null // 로그인 이메일
  role?: UserRole // 권한
  isActive?: boolean // 활성 상태
  resetPassword?: string // 비밀번호 재설정 값
}

// 관리자 사용자 목록 아이템 DTO
export type AdminUserListItemDto = {
  id: string // 식별자
  displayName: string // 표시 이름
  email: string // 로그인 이메일
  role: UserRole // 권한
  isActive: boolean // 활성 상태
  createdAt: string // 생성 시각(ISO datetime)
}
