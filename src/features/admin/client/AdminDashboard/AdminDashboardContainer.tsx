"use client"

import { ADMIN_MENU_ITEMS } from "@/features/admin/isomorphic"
import { AdminDashboardView } from "./AdminDashboardView"

export function AdminDashboardContainer() {
  // 현재는 정적 메뉴 목록으로 시작하고, 추후 권한 기반 필터를 적용한다.
  return <AdminDashboardView menuItems={ADMIN_MENU_ITEMS} />
}
