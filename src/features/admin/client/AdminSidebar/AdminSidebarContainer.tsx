"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ADMIN_MENU_ITEMS } from "@/features/admin/isomorphic"

type AdminSidebarContainerProps = {
  // 사이드바 루트에 추가로 붙일 className
  className?: string
  // 메뉴 클릭 시 실행할 콜백(모바일 드로어 닫기 용도)
  onNavigate?: () => void
}

export function AdminSidebarContainer({
  className,
  onNavigate,
}: AdminSidebarContainerProps) {
  // 현재 URL 경로를 기준으로 활성 메뉴 스타일을 결정한다.
  const pathname = usePathname()

  return (
    <aside
      className={[
        "w-full rounded-lg border bg-white p-3 lg:w-64",
        className ?? "",
      ].join(" ")}
    >
      {/* 사이드바 상단 타이틀 영역 */}
      <p className="mb-3 text-sm font-semibold text-neutral-700">관리 메뉴</p>

      {/* 관리자 메뉴 목록 */}
      <nav className="space-y-1">
        {ADMIN_MENU_ITEMS.map((item) => {
          // 현재 경로가 메뉴 경로와 일치하거나 하위 경로인지 확인한다.
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={
                isActive
                  ? "block rounded-md bg-neutral-900 px-3 py-2 text-sm text-white"
                  : "block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
              }
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
