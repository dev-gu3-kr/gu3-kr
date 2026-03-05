"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ADMIN_MENU_ITEMS } from "@/features/admin/isomorphic"

type AdminSidebarContainerProps = {
  className?: string
  onNavigate?: () => void
}

export function AdminSidebarContainer({
  className,
  onNavigate,
}: AdminSidebarContainerProps) {
  const pathname = usePathname()
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

  return (
    <aside
      className={[
        "w-full rounded-lg border bg-white p-3 lg:w-64",
        className ?? "",
      ].join(" ")}
    >
      <p className="mb-3 text-sm font-semibold text-neutral-700">관리 메뉴</p>

      <nav className="space-y-1">
        {menuItems.map((item) => {
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
