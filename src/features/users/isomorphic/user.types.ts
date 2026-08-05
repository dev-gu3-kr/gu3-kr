import type { UserRole } from "@prisma/client"
import type { AdminMenuPermission } from "@/features/admin/isomorphic"

// 관리자 사용자 생성 요청 DTO
export type CreateAdminUserInputDto = {
  displayName: string // 표시 이름
  username: string // 영문·숫자와 일부 기호로 구성된 관리자 로그인 아이디
  password: string // 초기 비밀번호
  menuPermissions: AdminMenuPermission[] // 메뉴 단위 전체 CRUD 권한 목록
  isActive?: boolean // 활성 상태
}

// 관리자 사용자 수정 요청 DTO
export type UpdateAdminUserInputDto = {
  displayName?: string // 표시 이름
  username?: string // 변경할 관리자 로그인 아이디
  isActive?: boolean // 활성 상태
  resetPassword?: string // 비밀번호 재설정 값
  menuPermissions?: AdminMenuPermission[] // 메뉴 단위 전체 CRUD 권한 목록
}

// 관리자별 메뉴 권한만 변경하는 설정 폼 DTO
export type UpdateAdminUserMenuPermissionsInputDto = {
  menuPermissions: AdminMenuPermission[] // 메뉴 단위 전체 CRUD 권한 목록
}

// 관리자 사용자 목록 아이템 DTO
export type AdminUserListItemDto = {
  id: string // 식별자
  displayName: string // 표시 이름
  username: string // 관리자 로그인 아이디
  role: UserRole // 권한
  menuPermissions: AdminMenuPermission[] // 메뉴 단위 전체 CRUD 권한 목록
  isActive: boolean // 활성 상태
  createdAt: string // 생성 시각(ISO datetime)
}
