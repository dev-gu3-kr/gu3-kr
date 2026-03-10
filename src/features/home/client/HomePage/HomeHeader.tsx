"use client"

import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { AppLink as Link } from "@/components/AppLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
    { key: "pastoralGoal", label: "사목 목표", url: "/parish/pastoral-goal" },
    { key: "priestIntro", label: "신부님 소개", url: "/parish/priests" },
    { key: "nunIntro", label: "수녀님 소개", url: "/parish/nuns" },
    { key: "salesians", label: "살레시오회", url: "/parish/salesians" },
    { key: "directions", label: "오시는 길", url: "/parish/directions" },
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
  const [isSubMenuDismissed, setIsSubMenuDismissed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const defaultOpenMobileMenu = useMemo<TopMenuKey>(() => {
    for (const item of navItems) {
      const key = MENU_KEY_BY_LABEL[item.label]
      if (key && isMenuActive(key, pathname)) {
        return key
      }
    }

    return "parish"
  }, [navItems, pathname])

  const [mobileAccordionValue, setMobileAccordionValue] = useState<string>(
    defaultOpenMobileMenu,
  )

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

  const headerClassName = `group fixed inset-x-0 top-0 z-40 border-b transition-colors duration-150 ${!isSubMenuDismissed ? "lg:hover:border-neutral-200 lg:hover:bg-white" : ""} ${isLight ? "border-neutral-200 bg-white" : "border-transparent"}`

  const subMenuPanelClassName = `hidden pointer-events-none absolute inset-x-0 top-full border-t border-transparent bg-white opacity-0 transition-[opacity,border-color] duration-150 ease-out delay-75 lg:block ${!isSubMenuDismissed ? "lg:group-hover:pointer-events-auto lg:group-hover:border-neutral-200 lg:group-hover:opacity-100 lg:group-hover:delay-0" : ""}`

  const handleSubMenuClick = () => {
    setIsSubMenuDismissed(true)
    window.setTimeout(() => setIsSubMenuDismissed(false), 250)
  }

  return (
    <header className={headerClassName}>
      <div
        className={`relative mx-auto flex h-22 w-full max-w-[1380px] items-center justify-center px-5 transition-colors duration-150 md:px-8 lg:grid lg:grid-cols-[300px_1fr] lg:justify-normal lg:group-hover:text-neutral-900 ${isLight ? "text-neutral-900" : "text-white"}`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-4 rounded-md transition-opacity hover:opacity-90 lg:justify-start"
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

        <div className="absolute right-5 top-1/2 -translate-y-1/2 md:right-8 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-[42px] place-items-center bg-transparent text-white"
                aria-label="모바일 메뉴 열기"
              >
                <Menu className="size-7" strokeWidth={2.2} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[92%] max-w-[340px] overflow-y-auto border-l border-neutral-200 bg-white px-0"
            >
              <SheetHeader className="px-6 pb-5 pt-6 text-left">
                <div className="flex items-center justify-end">
                  <SheetTitle className="sr-only">모바일 메뉴</SheetTitle>
                  <SheetClose asChild>
                    <button
                      type="button"
                      aria-label="모바일 메뉴 닫기"
                      className="grid size-8 place-items-center text-neutral-900"
                    >
                      <X className="size-7" strokeWidth={2.1} />
                    </button>
                  </SheetClose>
                </div>
              </SheetHeader>

              <nav>
                <Accordion
                  type="single"
                  collapsible
                  value={mobileAccordionValue}
                  onValueChange={setMobileAccordionValue}
                  className="border-y border-neutral-200"
                >
                  {navItems.map((item) => {
                    const menuKey = MENU_KEY_BY_LABEL[item.label]
                    const subMenus = menuKey ? SUB_MENU_BY_KEY[menuKey] : []
                    const accordionValue = menuKey ?? `menu-${item.label}`

                    return (
                      <AccordionItem
                        key={`mobile-${item.label}`}
                        value={accordionValue}
                      >
                        <AccordionTrigger className="px-6 py-5 hover:no-underline [&>svg]:hidden">
                          <span className="text-[20px] font-semibold leading-none tracking-[-0.01em] text-neutral-900">
                            {item.label}
                          </span>
                          <span className="grid size-8 place-items-center rounded-full border border-neutral-300 text-neutral-900">
                            <svg
                              aria-hidden="true"
                              className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </AccordionTrigger>

                        <AccordionContent className="bg-[#f4f4f6] px-6 py-4">
                          {subMenus.length > 0 ? (
                            <ul>
                              {subMenus.map((subMenu) => {
                                const active = isPathActive(
                                  pathname,
                                  subMenu.url,
                                )

                                return (
                                  <li
                                    key={`mobile-${item.label}-${subMenu.key}`}
                                  >
                                    <SheetClose asChild>
                                      <Link
                                        href={subMenu.url}
                                        className={`block py-2 text-[16px] leading-none tracking-[-0.01em] ${active ? "font-semibold text-neutral-900" : "font-medium text-neutral-800"}`}
                                      >
                                        {subMenu.label}
                                      </Link>
                                    </SheetClose>
                                  </li>
                                )
                              })}
                            </ul>
                          ) : null}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </nav>

              <section className="bg-[#f4f4f6] px-6 py-6 text-neutral-900">
                <h3 className="text-xl font-semibold">미사 안내</h3>
                <div className="mt-5 space-y-4 text-[16px] leading-[1.5]">
                  <div>
                    <p className="font-semibold">주일 미사</p>
                    <p className="mt-1">
                      오전 : 6시 30분 (새벽), 10시 30분 (교중)
                    </p>
                    <p>
                      오후 : 12시 (중고등부), 3시 (유초등부), 6시 (청년부), 9시
                      (밤)
                    </p>
                    <p>토요일 : 오후 7시(토요주일)</p>
                  </div>
                  <div>
                    <p className="font-semibold">평일 미사</p>
                    <p className="mt-1">
                      월/화/수/금요일 : 오전 6시 30분, 오후 7시
                    </p>
                    <p>목요일 : 오전 6시 30분, 오전 10시, 오후 7시</p>
                    <p>토요일 : 오전 6시 30분</p>
                  </div>
                </div>
              </section>
            </SheetContent>
          </Sheet>
        </div>

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

      <div className={subMenuPanelClassName}>
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
                            onClick={handleSubMenuClick}
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
