import type { Metadata } from "next"
import { cookies } from "next/headers"
import type { ReactNode } from "react"
import { authService } from "@/features/auth/server"
import { ADMIN_REFRESH_COOKIE_KEY } from "@/lib/auth/cookies"
import "./admin.css"
import { AdminLayoutClient } from "./AdminLayoutClient"

type AdminLayoutProps = {
  children: ReactNode
}

// 인증 화면과 운영 도구가 검색 결과에 노출되지 않도록 관리자 영역 전체에 적용한다.
export const metadata: Metadata = {
  title: "관리자",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
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
