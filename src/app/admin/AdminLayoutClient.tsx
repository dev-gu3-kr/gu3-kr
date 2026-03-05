"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"
import { useEffect, useState } from "react"
import { AdminSidebarContainer } from "@/features/admin/client"

type AdminLayoutClientProps = {
  // 관리자 라우트 하위 페이지 콘텐츠
  children: ReactNode
}

export function AdminLayoutClient({
  children,
  initialDisplayName,
}: AdminLayoutClientProps & { initialDisplayName: string | null }) {
  // 로그인 페이지 여부를 경로로 판단한다.
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"
  // 로그아웃 후 이동에 사용할 라우터다.
  const router = useRouter()
  // 모바일 메뉴 드로어 열림 상태다.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const displayName = initialDisplayName
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    if (!pathname) return
    setIsNavigating(false)
  }, [pathname])

  const handleRouteIntentCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (isLoginPage) return

    const target = event.target as HTMLElement | null
    const anchor = target?.closest("a[href]") as HTMLAnchorElement | null
    if (!anchor) return

    const href = anchor.getAttribute("href")
    if (!href) return
    if (!href.startsWith("/")) return
    if (anchor.target === "_blank") return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    setIsNavigating(true)
  }

  const handleLogout = async () => {
    // 서버 로그아웃 API를 호출해 세션 쿠키를 만료시킨다.
    setIsNavigating(true)
    await fetch("/api/admin/logout", {
      method: "POST",
    })

    // 로그인 페이지로 이동한 뒤 라우트를 새로고침한다.
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-neutral-50"
      onClickCapture={handleRouteIntentCapture}
    >
      {/* 관리자 공통 상단 헤더 */}
      <header className="relative border-b bg-white">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-sky-500 transition-[width,opacity] duration-200 ${
            isNavigating ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
          aria-hidden="true"
        />
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

          {/* 로그인 페이지가 아닐 때만 로그아웃 버튼을 노출한다. */}
          {!isLoginPage ? (
            <div className="flex items-center gap-2">
              {displayName ? (
                <p className="text-sm text-neutral-600">{displayName}</p>
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
        // 로그인 페이지는 단일 컬럼으로 표시한다.
        <div className="mx-auto max-w-5xl p-4">{children}</div>
      ) : (
        // 보호 페이지는 좌측 메뉴 + 우측 본문 2열로 구성한다.
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
