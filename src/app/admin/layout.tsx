import { cookies } from "next/headers"
import type { ReactNode } from "react"
import { authService } from "@/features/auth/server"
import { ADMIN_REFRESH_COOKIE_KEY } from "@/lib/auth/cookies"
import "./admin.css"
import { AdminLayoutClient } from "./AdminLayoutClient"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE_KEY)?.value ?? null
  const author = await authService.getAdminFromRefreshToken(refreshToken)

  return (
    <AdminLayoutClient initialDisplayName={author?.displayName ?? null}>
      {children}
    </AdminLayoutClient>
  )
}
