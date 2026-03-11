"use client"

import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import { useEffect } from "react"
import "nprogress/nprogress.css"

function shouldHandleAnchorClick(event: MouseEvent) {
  if (event.defaultPrevented) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false

  const target = event.target as HTMLElement | null
  const anchor = target?.closest("a[href]") as HTMLAnchorElement | null
  if (!anchor) return false
  if (anchor.target === "_blank") return false
  if (anchor.hasAttribute("download")) return false

  const href = anchor.getAttribute("href")
  if (!href) return false
  if (!href.startsWith("/")) return false

  try {
    const nextUrl = new URL(href, window.location.href)
    const currentUrl = new URL(window.location.href)

    const looksLikeDownloadRoute =
      /\/(download|exports?|attachments?|files?)($|\/)/.test(
        nextUrl.pathname,
      ) ||
      nextUrl.searchParams.get("download") === "1" ||
      nextUrl.searchParams.get("disposition") === "attachment"

    if (looksLikeDownloadRoute) {
      return false
    }

    if (
      nextUrl.pathname === currentUrl.pathname &&
      nextUrl.search === currentUrl.search &&
      nextUrl.hash === currentUrl.hash
    ) {
      return false
    }
  } catch {
    return false
  }

  return true
}

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()

  useEffect(() => {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.08,
      easing: "ease",
      speed: 320,
      trickleSpeed: 140,
    })

    const handleClick = (event: MouseEvent) => {
      if (!shouldHandleAnchorClick(event)) return
      NProgress.start()
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  useEffect(() => {
    if (!pathname) return
    void search
    NProgress.done()
  }, [pathname, search])

  return null
}
