"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { getAccessibleAdminMenuItems } from "@/features/admin/isomorphic"
import { useAdminSession } from "@/features/auth/isomorphic"
import { cn } from "@/lib/utils"

type AdminSidebarContainerProps = {
  className?: string
  onNavigate?: () => void
}

export function AdminSidebarContainer({
  className,
  onNavigate,
}: AdminSidebarContainerProps) {
  const pathname = usePathname()
  const sessionQuery = useAdminSession()

  const menuItems = useMemo(() => {
    return getAccessibleAdminMenuItems(
      sessionQuery.data?.role,
      sessionQuery.data?.menuPermissions ?? [],
    )
  }, [sessionQuery.data])

  return (
    <aside
      className={cn("w-full rounded-lg border bg-white p-3 lg:w-64", className)}
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
              prefetch={false}
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
