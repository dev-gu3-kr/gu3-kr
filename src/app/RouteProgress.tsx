"use client"

import { usePathname } from "next/navigation"
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

  const href = anchor.getAttribute("href")
  if (!href) return false
  if (!href.startsWith("/")) return false

  return true
}

export function RouteProgress() {
  const pathname = usePathname()

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
    NProgress.done()
  }, [pathname])

  return null
}
