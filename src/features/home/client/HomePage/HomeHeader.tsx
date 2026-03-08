"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { AppLink as Link } from "@/components/AppLink"
import type { HomeNavItem } from "@/features/home/isomorphic"

type HomeHeaderProps = {
  readonly navItems: readonly HomeNavItem[]
}

type TopMenuKey =
  | "parish"
  | "notice"
  | "office"
  | "community"
  | "youth"
  | "faith"

type SubMenuKey =
  | "parishAbout"
  | "pastoralGoal"
  | "priestIntro"
  | "nunIntro"
  | "salesians"
  | "directions"
  | "facilities"
  | "notices"
  | "massTimes"
  | "weeklyBulletin"
  | "parishCalendar"
  | "gallery"
  | "catechumenClass"
  | "infantBaptism"
  | "marriage"
  | "anointing"
  | "funeralGuide"
  | "officeGuide"
  | "pastoralCouncil"
  | "districtMap"
  | "inquiry"
  | "communityIntro"
  | "youthBlog"
  | "youthIntro"
  | "catholicDoctrine"
  | "prayers"

type SubMenuItem = {
  readonly key: SubMenuKey
  readonly label: string
  readonly url: string
}

const MENU_CELL_INNER_CLASS = "mx-auto w-full max-w-[160px]"

const MENU_KEY_BY_LABEL: Record<string, TopMenuKey> = {
  "구로3동 성당": "parish",
  본당알림: "notice",
  본당업무: "office",
  "공동체 마당": "community",
  "청소년 마당": "youth",
  신앙생활: "faith",
}

const SUB_MENU_BY_KEY: Record<TopMenuKey, readonly SubMenuItem[]> = {
  parish: [
    { key: "parishAbout", label: "본당 소개", url: "/parish/about" },
    { key: "pastoralGoal", label: "사목 목표", url: "/" },
    { key: "priestIntro", label: "신부님 소개", url: "/parish/priests" },
    { key: "nunIntro", label: "수녀님 소개", url: "/parish/nuns" },
    { key: "salesians", label: "살레시오회", url: "/" },
    { key: "directions", label: "오시는 길", url: "/" },
    { key: "facilities", label: "부속 시설", url: "/" },
  ],
  notice: [
    { key: "notices", label: "공지사항", url: "/" },
    { key: "massTimes", label: "미사 시간", url: "/" },
    { key: "weeklyBulletin", label: "본당 주보", url: "/" },
    { key: "parishCalendar", label: "본당 달력", url: "/" },
    { key: "gallery", label: "갤러리", url: "/" },
  ],
  office: [
    { key: "catechumenClass", label: "예비신자 교리", url: "/" },
    { key: "infantBaptism", label: "유아세례", url: "/" },
    { key: "marriage", label: "혼인성사", url: "/" },
    { key: "anointing", label: "병자성사", url: "/" },
    { key: "funeralGuide", label: "선종 안내", url: "/" },
    { key: "officeGuide", label: "사무실 안내", url: "/" },
  ],
  community: [
    { key: "pastoralCouncil", label: "사목협의회", url: "/" },
    { key: "districtMap", label: "관할 구역도", url: "/" },
    { key: "inquiry", label: "1:1 문의", url: "/" },
    { key: "communityIntro", label: "공동체 마당 소개", url: "/" },
  ],
  youth: [
    { key: "youthBlog", label: "청소년 블로그", url: "/" },
    { key: "youthIntro", label: "청소년 마당 소개", url: "/" },
  ],
  faith: [
    { key: "catholicDoctrine", label: "가톨릭 교리", url: "/" },
    { key: "prayers", label: "기도문", url: "/" },
  ],
}

function isMenuActive(menuKey: TopMenuKey, pathname: string) {
  const candidatePaths = SUB_MENU_BY_KEY[menuKey]
    .map((subMenu) => subMenu.url)
    .filter((url) => url !== "/")

  return candidatePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

function isPathActive(pathname: string, targetUrl: string) {
  if (targetUrl === "/") {
    return false
  }

  return pathname === targetUrl || pathname.startsWith(`${targetUrl}/`)
}

export function HomeHeader({ navItems }: HomeHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
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
          {navItems.map((item) => {
            const menuKey = MENU_KEY_BY_LABEL[item.label]
            const active = menuKey ? isMenuActive(menuKey, pathname) : false

            return (
              <button
                key={item.label}
                type="button"
                className="relative flex h-22 w-full items-center justify-center text-sm font-semibold leading-none text-inherit transition-colors duration-150"
              >
                <span
                  className={`${MENU_CELL_INNER_CLASS} block text-center leading-none ${active ? "lg:group-hover:text-[#8b1c21]" : ""}`}
                >
                  {item.label}
                </span>
                <span
                  className={`pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[160px] -translate-x-1/2 bg-[#8b1c21] opacity-0 transition-opacity duration-150 ${active ? "lg:group-hover:opacity-100" : ""}`}
                />
              </button>
            )
          })}
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
              const menuKey = MENU_KEY_BY_LABEL[item.label]
              const subMenus = menuKey ? SUB_MENU_BY_KEY[menuKey] : []

              return (
                <div key={`submenu-${item.label}`}>
                  <ul className={`${MENU_CELL_INNER_CLASS} space-y-1.5`}>
                    {subMenus.map((subMenu) => {
                      const active = isPathActive(pathname, subMenu.url)

                      return (
                        <li key={`${item.label}-${subMenu.key}`}>
                          <Link
                            href={subMenu.url}
                            className={`block text-center text-sm transition-colors duration-150 hover:text-[#8b1c21] ${active ? "text-[#8b1c21]" : "text-neutral-600"}`}
                          >
                            {subMenu.label}
                          </Link>
                        </li>
                      )
                    })}
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
