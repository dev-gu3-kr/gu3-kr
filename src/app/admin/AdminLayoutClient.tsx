"use client"

import { Menu, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useState } from "react"
import { AppLink as Link } from "@/components/AppLink"
import { AdminSidebarContainer } from "@/features/admin/client"

type AdminLayoutClientProps = {
  children: ReactNode
  initialDisplayName: string | null
}

export function AdminLayoutClient({
  children,
  initialDisplayName,
}: AdminLayoutClientProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {!isLoginPage ? (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex rounded-md border p-2 lg:hidden"
                aria-label="모바일 메뉴 열기"
              >
                <Menu className="h-5 w-5" />
              </button>
            ) : null}

            <Link
              href="/admin"
              className="rounded-md px-1 py-0.5 hover:bg-neutral-50"
            >
              <p className="text-sm text-neutral-500">구로3동 성당</p>
              <p className="text-lg font-semibold">홈페이지 관리자</p>
            </Link>
          </div>

          {!isLoginPage ? (
            <div className="flex items-center gap-2">
              {initialDisplayName ? (
                <p className="text-sm text-neutral-600">{initialDisplayName}</p>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                로그아웃
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {!isLoginPage && isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="모바일 메뉴 닫기"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="relative h-full w-[280px] border-r bg-white p-3 shadow-xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-1 py-0.5 text-left hover:bg-neutral-50"
              >
                <p className="text-sm text-neutral-500">구로3동 성당</p>
                <p className="text-lg font-semibold">홈페이지 관리자</p>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md border p-2"
                aria-label="모바일 메뉴 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <AdminSidebarContainer
              className="w-full border-0 p-0 lg:w-full"
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      {isLoginPage ? (
        <div className="mx-auto max-w-5xl p-4">{children}</div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[256px_1fr]">
          <div className="hidden lg:block">
            <AdminSidebarContainer />
          </div>
          <section className="min-h-[70vh] min-w-0 rounded-lg border bg-white p-4">
            {children}
          </section>
        </div>
      )}
    </div>
  )
}
