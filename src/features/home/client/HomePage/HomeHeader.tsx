"use client"

import { useEffect, useState } from "react"

import { AppLink as Link } from "@/components/AppLink"
import type { HomeNavItem } from "@/features/home/isomorphic"

type HomeHeaderProps = {
  readonly navItems: readonly HomeNavItem[]
}

const MENU_CELL_INNER_CLASS = "mx-auto w-full max-w-[160px]"

const SUB_MENU_BY_LABEL: Record<string, readonly string[]> = {
  "구로3동 성당": [
    "본당 소개",
    "사목 목표",
    "신부님 소개",
    "수녀님 소개",
    "살레시오회",
    "오시는 길",
    "부속 시설",
  ],
  본당알림: ["공지사항", "미사 시간", "본당 주보", "본당 달력", "갤러리"],
  본당업무: [
    "예비신자 교리",
    "유아세례",
    "혼인성사",
    "병자성사",
    "선종 안내",
    "사무실 안내",
  ],
  "공동체 마당": ["사목협의회", "관할 구역도", "1:1 문의", "공동체 마당 소개"],
  "청소년 마당": ["청소년 블로그", "청소년 마당 소개"],
  신앙생활: ["가톨릭 교리", "기도문"],
}

export function HomeHeader({ navItems }: HomeHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY >= window.innerHeight * 0.5)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  const menuColumnTemplate = `repeat(${Math.max(navItems.length, 1)}, minmax(0, 1fr))`
  const isLight = isScrolled

  return (
    <header
      className={`group fixed inset-x-0 top-0 z-40 border-b transition-colors duration-150 lg:hover:border-neutral-200 lg:hover:bg-white ${isLight ? "border-neutral-200 bg-white" : "border-transparent"}`}
    >
      <div
        className={`mx-auto grid h-22 w-full max-w-[1380px] grid-cols-[300px_1fr] items-center px-5 transition-colors duration-150 md:px-8 lg:group-hover:text-neutral-900 ${isLight ? "text-neutral-900" : "text-white"}`}
      >
        <Link
          href="/"
          className="flex items-center gap-4 rounded-md transition-opacity hover:opacity-90"
          aria-label="홈으로 이동"
        >
          <div
            className={`grid size-12 place-items-center rounded-full bg-white/90 text-[10px] font-bold tracking-[0.24em] text-[#7a1418] transition-colors duration-150 lg:group-hover:border-[#7a1418]/30 ${isLight ? "border border-[#7a1418]/30" : "border border-white/40"}`}
          >
            G3
          </div>
          <div className="leading-tight">
            <p
              className={`text-xs font-medium uppercase tracking-[0.28em] transition-colors duration-150 ${isLight ? "text-neutral-500" : "text-white/70"} lg:group-hover:text-neutral-500`}
            >
              Catholic Cathedral
            </p>
            <p className="text-sm font-semibold md:text-base">
              천주교 서울대교구 구로3동성당
            </p>
          </div>
        </Link>

        <nav
          className={`hidden h-full items-center transition-colors duration-150 lg:grid ${isLight ? "text-neutral-900" : "text-white"} lg:group-hover:text-neutral-900`}
          style={{ gridTemplateColumns: menuColumnTemplate }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex h-22 w-full items-center justify-center text-sm font-semibold leading-none text-inherit transition-colors duration-150 hover:text-[#8b1c21]"
            >
              <span
                className={`${MENU_CELL_INNER_CLASS} block text-center leading-none`}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="hidden pointer-events-none absolute inset-x-0 top-full border-t border-transparent bg-white opacity-0 transition-[opacity,border-color] duration-150 ease-out delay-75 lg:block lg:group-hover:pointer-events-auto lg:group-hover:border-neutral-200 lg:group-hover:opacity-100 lg:group-hover:delay-0">
        <div className="mx-auto grid w-full max-w-[1380px] grid-cols-[300px_1fr] px-5 py-6 md:px-8">
          <div className="mr-8 h-[180px] rounded-xl border border-dashed border-neutral-300 bg-neutral-50" />

          <div
            className="grid"
            style={{ gridTemplateColumns: menuColumnTemplate }}
          >
            {navItems.map((item) => {
              const subMenus = SUB_MENU_BY_LABEL[item.label] ?? []

              return (
                <div key={`submenu-${item.label}`}>
                  <ul className={`${MENU_CELL_INNER_CLASS} space-y-1.5`}>
                    {subMenus.map((subItem) => (
                      <li key={`${item.label}-${subItem}`}>
                        <Link
                          href="/"
                          className="block text-center text-sm text-neutral-600 transition-colors duration-150 hover:text-[#8b1c21]"
                        >
                          {subItem}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
