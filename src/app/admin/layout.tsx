import { cookies } from "next/headers"
import type { ReactNode } from "react"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"
import { authService } from "@/features/auth/server"
import "./admin.css"
import { AdminLayoutClient } from "./AdminLayoutClient"

type AdminLayoutProps = {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies()
  const authorId = cookieStore.get(ADMIN_SESSION_COOKIE_KEY)?.value
  const author = authorId
    ? await authService.getLoginCandidateById(authorId)
    : null

  return (
    <AdminLayoutClient initialDisplayName={author?.displayName ?? null}>
      {children}
    </AdminLayoutClient>
  )
}
