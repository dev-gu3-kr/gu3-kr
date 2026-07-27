import type { UserRole } from "@prisma/client"
import type { AdminMenuPermission } from "@/features/admin/isomorphic"

// 로그인 요청 DTO
export type LoginInput = {
  email: string // 로그인 이메일
  password: string // 로그인 비밀번호
}

// 관리자 메뉴 노출과 권한 판단에 사용하는 현재 세션 DTO
export type AdminSessionDto = {
  role: UserRole // 최고관리자 우회 권한 판단용 역할
  displayName: string // 화면에 표시할 관리자 이름
  menuPermissions: AdminMenuPermission[] // 일반 관리자의 메뉴 단위 전체 CRUD 권한
}
