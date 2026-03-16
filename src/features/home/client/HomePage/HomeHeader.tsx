"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { AppLink as Link } from "@/components/AppLink"
import {
  Gu3LogoMarkSvg,
  Gu3LogoWordmarkSvg,
  MobileMenuHamburgerDarkIcon,
  MobileMenuHamburgerIcon,
} from "@/components/svgs"
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
    { key: "facilities", label: "부속 시설", url: "/parish/facilities" },
  ],
  notice: [
    { key: "notices", label: "공지사항", url: "/notice/notices" },
    { key: "massTimes", label: "미사 시간", url: "/notice/mass-times" },
    {
      key: "weeklyBulletin",
      label: "본당 주보",
      url: "/notice/weekly-bulletin",
    },
    {
      key: "parishCalendar",
      label: "본당 달력",
      url: "/notice/parish-calendar",
    },
    { key: "gallery", label: "갤러리", url: "/notice/gallery" },
  ],
  office: [
    {
      key: "catechumenClass",
      label: "예비신자 교리",
      url: "/office/catechumen-class",
    },
    { key: "infantBaptism", label: "유아세례", url: "/office/infant-baptism" },
    { key: "marriage", label: "혼인성사", url: "/office/marriage" },
    { key: "anointing", label: "병자성사", url: "/office/anointing" },
    { key: "funeralGuide", label: "선종 안내", url: "/office/funeral-guide" },
    { key: "officeGuide", label: "사무실 안내", url: "/office/office-guide" },
  ],
  community: [
    {
      key: "pastoralCouncil",
      label: "사목협의회",
      url: "/community/pastoral-council",
    },
    {
      key: "districtMap",
      label: "관할 구역도",
      url: "/community/district-map",
    },
    { key: "inquiry", label: "1:1 문의", url: "/community/inquiry" },
    {
      key: "communityIntro",
      label: "공동체 마당 소개",
      url: "/community/about",
    },
  ],
  youth: [
    { key: "youthBlog", label: "청소년 블로그", url: "/youth/blog" },
    { key: "youthIntro", label: "청소년 마당 소개", url: "/youth/about" },
  ],
  faith: [
    {
      key: "catholicDoctrine",
      label: "가톨릭 교리",
      url: "/faith/catholic-doctrine",
    },
    { key: "prayers", label: "기도문", url: "/faith/prayers" },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopSubMenuOpen, setIsDesktopSubMenuOpen] = useState(false)
  const [canUseDesktopHover, setCanUseDesktopHover] = useState(false)
  const [isDesktopHoverSuppressed, setIsDesktopHoverSuppressed] =
    useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const desktopMenuLabelRefs = useRef<
    Partial<Record<TopMenuKey, HTMLSpanElement | null>>
  >({})
  const pathname = usePathname()
  const [desktopMenuLabelWidths, setDesktopMenuLabelWidths] = useState<
    Partial<Record<TopMenuKey, number>>
  >({})

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)")

    // iPad Safari는 첫 탭에서 hover 스타일만 먼저 적용해 서브메뉴 클릭을 소비할 수 있어 입력 방식 기준으로 hover를 제한한다.
    const syncDesktopHoverCapability = () => {
      setCanUseDesktopHover(mediaQuery.matches)
    }

    syncDesktopHoverCapability()

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncDesktopHoverCapability)

      return () => {
        mediaQuery.removeEventListener("change", syncDesktopHoverCapability)
      }
    }

    mediaQuery.addListener(syncDesktopHoverCapability)

    return () => {
      mediaQuery.removeListener(syncDesktopHoverCapability)
    }
  }, [])

  useEffect(() => {
    void pathname
    setIsDesktopSubMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isDesktopSubMenuOpen) {
      return
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsDesktopSubMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDesktopSubMenuOpen(false)
      }
    }

    document.addEventListener("click", handleDocumentClick)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("click", handleDocumentClick)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isDesktopSubMenuOpen])

  useEffect(() => {
    const headerElement = headerRef.current

    if (!headerElement) {
      return
    }

    const handleMouseLeave = () => {
      setIsDesktopHoverSuppressed(false)
    }

    headerElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      headerElement.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    const labelEntries = Object.entries(desktopMenuLabelRefs.current) as [
      TopMenuKey,
      HTMLSpanElement | null,
    ][]

    if (labelEntries.length === 0) {
      return
    }

    // 1차 메뉴 텍스트 폭을 기준으로 2차 메뉴 시작점을 맞춘다.
    const measureDesktopMenuLabelWidths = () => {
      const nextWidths: Partial<Record<TopMenuKey, number>> = {}

      for (const [menuKey, labelElement] of labelEntries) {
        if (!labelElement) {
          continue
        }

        nextWidths[menuKey] = Math.ceil(
          labelElement.getBoundingClientRect().width,
        )
      }

      setDesktopMenuLabelWidths((previousWidths) => {
        const previousKeys = Object.keys(previousWidths) as TopMenuKey[]
        const nextKeys = Object.keys(nextWidths) as TopMenuKey[]

        if (
          previousKeys.length === nextKeys.length &&
          nextKeys.every(
            (menuKey) => previousWidths[menuKey] === nextWidths[menuKey],
          )
        ) {
          return previousWidths
        }

        return nextWidths
      })
    }

    measureDesktopMenuLabelWidths()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measureDesktopMenuLabelWidths)

      return () => {
        window.removeEventListener("resize", measureDesktopMenuLabelWidths)
      }
    }

    const resizeObserver = new ResizeObserver(measureDesktopMenuLabelWidths)

    for (const [, labelElement] of labelEntries) {
      if (labelElement) {
        resizeObserver.observe(labelElement)
      }
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const menuColumnTemplate = `repeat(${Math.max(navItems.length, 1)}, minmax(0, 1fr))`
  const isLight = isScrolled
  const isSubMenuOpen = isDesktopSubMenuOpen
  const isHeaderLight = isLight || isSubMenuOpen
  const canApplyDesktopHover = canUseDesktopHover && !isDesktopHoverSuppressed
  const desktopHoverHeaderClassName = canApplyDesktopHover
    ? "lg:hover:border-neutral-200 lg:hover:bg-white"
    : ""
  const desktopHoverTextClassName = canApplyDesktopHover
    ? "lg:group-hover:text-neutral-900"
    : ""
  const desktopHoverHideOverlayClassName = canApplyDesktopHover
    ? "lg:group-hover:hidden"
    : ""
  const desktopHoverSubMenuClassName = canApplyDesktopHover
    ? "lg:group-hover:pointer-events-auto lg:group-hover:border-neutral-200 lg:group-hover:bg-white"
    : ""
  const subMenuPanelStateClassName = isSubMenuOpen
    ? "pointer-events-auto border-neutral-200 bg-white"
    : "pointer-events-none border-transparent bg-transparent"
  const desktopHoverSubMenuContentClassName = canApplyDesktopHover
    ? "lg:group-hover:opacity-100"
    : ""
  const subMenuContentStateClassName = isSubMenuOpen
    ? "opacity-100"
    : "opacity-0"
  const desktopHoverActiveMenuTextClassName = canApplyDesktopHover
    ? "lg:group-hover:text-[#8b1c21]"
    : ""
  const desktopHoverActiveMenuIndicatorClassName = canApplyDesktopHover
    ? "lg:group-hover:opacity-100"
    : ""

  const headerClassName = `group fixed inset-x-0 top-0 z-40 border-b transition-colors duration-150 ${desktopHoverHeaderClassName} ${isHeaderLight ? "border-neutral-200 bg-white" : "border-transparent"}`

  const subMenuPanelClassName = `hidden absolute inset-x-0 top-full border-t transition-colors duration-150 lg:block ${subMenuPanelStateClassName} ${desktopHoverSubMenuClassName}`
  const subMenuContentClassName = `transition-opacity duration-150 ${subMenuContentStateClassName} ${desktopHoverSubMenuContentClassName}`
  const handleDesktopSubMenuLinkClick = () => {
    setIsDesktopSubMenuOpen(false)

    if (canUseDesktopHover) {
      setIsDesktopHoverSuppressed(true)
    }
  }

  return (
    <header ref={headerRef} className={headerClassName}>
      {!isLight && !isSubMenuOpen ? (
        <div
          className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.62)_36%,rgba(0,0,0,0.24)_72%,rgba(0,0,0,0)_100%)] ${desktopHoverHideOverlayClassName}`}
        />
      ) : null}

      <div
        className={`relative mx-auto flex h-22 w-full max-w-[1380px] items-center justify-center px-5 transition-colors duration-150 md:px-8 lg:grid lg:grid-cols-[300px_1fr] lg:justify-normal ${desktopHoverTextClassName} ${isHeaderLight ? "text-neutral-900" : "text-white"}`}
      >
        <Link
          href="/"
          className="flex items-center justify-center gap-3 rounded-md transition-opacity hover:opacity-90 lg:justify-start"
          aria-label="홈으로 이동"
        >
          <Gu3LogoMarkSvg className="size-11 shrink-0 md:size-12" />
          <Gu3LogoWordmarkSvg
            className={`h-9 w-auto transition-colors duration-150 md:h-10 ${isHeaderLight ? "text-[#252629]" : "text-white"} ${canApplyDesktopHover ? "lg:group-hover:text-[#252629]" : ""}`}
          />
        </Link>

        <div className="absolute right-5 top-1/2 -translate-y-1/2 md:right-8 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className={
                  isLight
                    ? "grid size-[42px] place-items-center bg-transparent transition-colors text-[#252629]"
                    : "grid size-[42px] place-items-center bg-transparent transition-colors text-white"
                }
                aria-label="모바일 메뉴 열기"
              >
                {isLight ? (
                  <MobileMenuHamburgerDarkIcon className="h-6 w-6" />
                ) : (
                  <MobileMenuHamburgerIcon className="h-6 w-6" />
                )}
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
          className={`hidden h-full items-center transition-colors duration-150 lg:grid ${isHeaderLight ? "text-neutral-900" : "text-white"} ${desktopHoverTextClassName}`}
          style={{ gridTemplateColumns: menuColumnTemplate }}
        >
          {navItems.map((item) => {
            const menuKey = MENU_KEY_BY_LABEL[item.label]
            const active = menuKey ? isMenuActive(menuKey, pathname) : false

            return (
              <button
                key={item.label}
                type="button"
                className="relative flex h-22 w-full items-center justify-center text-base font-semibold leading-none text-inherit transition-colors duration-150"
                onClick={() => setIsDesktopSubMenuOpen(true)}
                aria-expanded={isSubMenuOpen}
                aria-controls="home-header-submenu"
              >
                <span
                  className={`${MENU_CELL_INNER_CLASS} flex h-full items-center justify-center`}
                >
                  <span
                    ref={(node) => {
                      if (menuKey) {
                        desktopMenuLabelRefs.current[menuKey] = node
                      }
                    }}
                    className="relative inline-flex h-full items-center"
                  >
                    <span
                      className={`block text-center leading-none ${active ? desktopHoverActiveMenuTextClassName : ""}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-full bg-[#8b1c21] opacity-0 transition-opacity duration-150 ${active ? desktopHoverActiveMenuIndicatorClassName : ""}`}
                    />
                  </span>
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      <div id="home-header-submenu" className={subMenuPanelClassName}>
        <div
          className={`mx-auto grid w-full max-w-[1380px] grid-cols-[300px_1fr] px-5 py-7 md:px-8 ${subMenuContentClassName}`}
        >
          <div className="mr-8">
            <div className="flex h-[170px] items-center justify-center rounded-[22px] bg-[#efefef]">
              <Image
                src="/images/salesians-emblem.png"
                alt="살레시오회 엠블럼"
                width={118}
                height={118}
                className="h-[118px] w-[118px] object-contain"
              />
            </div>
            <p className="mt-4 text-center text-[14px] font-medium leading-[1.35] tracking-[-0.01em] text-[#3f4043]">
              Catholic Church of the Seoul Archdiocese
              <br />
              Salesians of Don Bosco
            </p>
          </div>

          <div
            className="grid"
            style={{ gridTemplateColumns: menuColumnTemplate }}
          >
            {navItems.map((item) => {
              const menuKey = MENU_KEY_BY_LABEL[item.label]
              const subMenus = menuKey ? SUB_MENU_BY_KEY[menuKey] : []
              const subMenuAnchorWidth = menuKey
                ? desktopMenuLabelWidths[menuKey]
                : undefined

              return (
                <div key={`submenu-${item.label}`}>
                  <div
                    className="mx-auto"
                    style={
                      subMenuAnchorWidth
                        ? { width: `${subMenuAnchorWidth}px` }
                        : undefined
                    }
                  >
                    <ul className="space-y-2.5">
                      {subMenus.map((subMenu) => {
                        const active = isPathActive(pathname, subMenu.url)

                        return (
                          <li key={`${item.label}-${subMenu.key}`}>
                            <Link
                              href={subMenu.url}
                              onClick={handleDesktopSubMenuLinkClick}
                              aria-current={active ? "page" : undefined}
                              className={`block whitespace-nowrap py-0 text-left text-sm font-semibold leading-[1.35] transition-colors duration-150 hover:text-[#8b1c21] ${active ? "text-[#8b1c21]" : "text-neutral-600"}`}
                            >
                              {subMenu.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
