// URL이나 화면 문구가 바뀌어도 저장된 권한이 유지되도록 고정 식별자를 사용한다.
export const ADMIN_MENU_PERMISSION_VALUES = [
  "NOTICES",
  "PRIESTS",
  "NUNS",
  "BULLETINS",
  "EVENTS",
  "GALLERY",
  "COMMUNITY_ABOUT",
  "PASTORAL_COUNCIL",
  "YOUTH_ABOUT",
  "YOUTH_BLOG",
  "INQUIRIES",
] as const

export type AdminMenuPermission = (typeof ADMIN_MENU_PERMISSION_VALUES)[number]

// 관리자 대시보드에서 노출할 메뉴 타입이다.
export type AdminMenuItem = {
  // 메뉴 라벨(사용자에게 보이는 이름)
  label: string
  // 이동할 관리자 경로
  href: string
  // 메뉴 설명(작업 목적 안내)
  description: string
  // 최고관리자 전용 메뉴 여부
  superAdminOnly?: boolean
  // 일반 관리자에게 메뉴 전체 CRUD 접근을 부여하는 고정 권한 식별자
  permission?: AdminMenuPermission
}

// 관리자 페이지 메뉴 목록이다.
export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "공지사항 관리",
    href: "/admin/notices",
    description: "공지 등록/수정/삭제 및 노출 상태를 관리한다.",
    permission: "NOTICES",
  },
  {
    label: "신부님 소개 관리",
    href: "/admin/clergy/priests",
    description: "신부님 프로필/재임기간/담당영역을 관리한다.",
    permission: "PRIESTS",
  },
  {
    label: "수녀님 소개 관리",
    href: "/admin/clergy/nuns",
    description: "수녀님 프로필/재임기간/담당영역을 관리한다.",
    permission: "NUNS",
  },
  {
    label: "본당주보 관리",
    href: "/admin/bulletins",
    description: "주보 파일 업로드와 게시글 메타데이터를 관리한다.",
    permission: "BULLETINS",
  },
  {
    label: "일정관리",
    href: "/admin/events",
    description: "본당 일정 등록/수정으로 달력 및 예정 일정을 운영한다.",
    permission: "EVENTS",
  },
  {
    label: "갤러리 관리",
    href: "/admin/gallery",
    description: "갤러리 게시글과 대표 이미지를 관리한다.",
    permission: "GALLERY",
  },
  {
    label: "공동체 마당 소개 관리",
    href: "/admin/community/about",
    description: "공동체 마당 소개 카드(이미지/제목/내용)를 관리한다.",
    permission: "COMMUNITY_ABOUT",
  },
  {
    label: "사목협의회 관리",
    href: "/admin/pastoral-council",
    description: "사목협의회 구성원 정보(이름/담당/연락처)를 관리한다.",
    permission: "PASTORAL_COUNCIL",
  },
  {
    label: "청소년 마당 소개 관리",
    href: "/admin/youth/about",
    description: "청소년 마당 소개 카드(이미지/제목/내용)를 관리한다.",
    permission: "YOUTH_ABOUT",
  },
  {
    label: "청소년 블로그 관리",
    href: "/admin/youth-blog",
    description: "청소년 마당 블로그 게시글을 관리한다.",
    permission: "YOUTH_BLOG",
  },
  {
    label: "1:1 문의 확인",
    href: "/admin/inquiries",
    description: "문의 접수 내역과 처리 상태를 확인한다.",
    permission: "INQUIRIES",
  },
  {
    label: "사용자 등록",
    href: "/admin/users",
    description: "관리자 계정을 생성하고 사용자별 관리 메뉴 권한을 설정한다.",
    superAdminOnly: true,
  },
]

export const ASSIGNABLE_ADMIN_MENU_ITEMS = ADMIN_MENU_ITEMS.filter(
  (item): item is AdminMenuItem & { permission: AdminMenuPermission } =>
    Boolean(item.permission) && !item.superAdminOnly,
)

// 최고관리자는 전체 메뉴를, 일반 관리자는 명시적으로 부여된 메뉴만 본다.
export function getAccessibleAdminMenuItems(
  role: string | null | undefined,
  permissions: readonly AdminMenuPermission[],
) {
  if (role === "SUPER_ADMIN") return ADMIN_MENU_ITEMS

  const allowed = new Set(permissions)
  return ASSIGNABLE_ADMIN_MENU_ITEMS.filter((item) =>
    allowed.has(item.permission),
  )
}
