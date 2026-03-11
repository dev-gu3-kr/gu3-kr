"use client"

import { useEffect, useMemo, useState } from "react"

import { ADMIN_MENU_ITEMS } from "@/features/admin/isomorphic"
import { AdminDashboardView } from "./AdminDashboardView"

export function AdminDashboardContainer() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      const response = await fetch("/api/admin/session", { cache: "no-store" })
      const json = (await response.json().catch(() => null)) as {
        ok?: boolean
        role?: string
      } | null

      if (!response.ok || !json?.ok || !json.role) {
        setRole(null)
        return
      }

      setRole(json.role)
    }

    void run()
  }, [])

  const menuItems = useMemo(() => {
    const isSuperAdmin = role === "SUPER_ADMIN"

    return ADMIN_MENU_ITEMS.filter((item) =>
      item.superAdminOnly ? isSuperAdmin : true,
    )
  }, [role])

  return <AdminDashboardView menuItems={menuItems} />
}
