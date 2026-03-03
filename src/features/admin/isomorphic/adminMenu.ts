// 관리자 대시보드에서 노출할 메뉴 타입이다.
export type AdminMenuItem = {
  // 메뉴 라벨(사용자에게 보이는 이름)
  label: string
  // 이동할 관리자 경로
  href: string
  // 메뉴 설명(작업 목적 안내)
  description: string
}

// 관리자 페이지 1차 스캐폴딩용 메뉴 목록이다.
export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "공지사항 관리",
    href: "/admin/notices",
    description: "공지 등록/수정/삭제 및 노출 상태를 관리한다.",
  },
  {
    label: "신부님 소개 관리",
    href: "/admin/clergy/priests",
    description: "신부님 프로필/재임기간/담당영역을 관리한다.",
  },
  {
    label: "수녀님 소개 관리",
    href: "/admin/clergy/nuns",
    description: "수녀님 프로필/재임기간/담당영역을 관리한다.",
  },
  {
    label: "본당주보 관리",
    href: "/admin/bulletins",
    description: "주보 파일 업로드와 게시글 메타데이터를 관리한다.",
  },
  {
    label: "일정관리",
    href: "/admin/events",
    description: "본당 일정 등록/수정으로 달력 및 예정 일정을 운영한다.",
  },
  {
    label: "갤러리 관리",
    href: "/admin/gallery",
    description: "갤러리 게시글과 대표 이미지를 관리한다.",
  },
  {
    label: "사목협의회 관리",
    href: "/admin/pastoral-council",
    description: "사목협의회 구성원 정보(이름/담당/연락처)를 관리한다.",
  },
  {
    label: "청소년 블로그 관리",
    href: "/admin/youth-blog",
    description: "청소년 마당 블로그 게시글을 관리한다.",
  },
  {
    label: "1:1 문의 확인",
    href: "/admin/inquiries",
    description: "문의 접수 내역과 처리 상태를 확인한다.",
  },
  {
    label: "사용자 등록",
    href: "/admin/users",
    description: "관리자 계정을 생성/비활성/권한 변경한다.",
  },
]
