"use client"

import { useMemo } from "react"
import { getAccessibleAdminMenuItems } from "@/features/admin/isomorphic"
import { useAdminSession } from "@/features/auth/isomorphic"
import { AdminDashboardView } from "./AdminDashboardView"

export function AdminDashboardContainer() {
  const sessionQuery = useAdminSession()

  const menuItems = useMemo(() => {
    return getAccessibleAdminMenuItems(
      sessionQuery.data?.role,
      sessionQuery.data?.menuPermissions ?? [],
    )
  }, [sessionQuery.data])

  return <AdminDashboardView menuItems={menuItems} />
}
