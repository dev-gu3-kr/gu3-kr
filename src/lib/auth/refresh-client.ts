"use client"

import { ADMIN_CSRF_COOKIE_KEY, getCookieFromHeader } from "./cookies"
import { ADMIN_CSRF_HEADER_KEY } from "./csrf"

let refreshPromise: Promise<boolean> | null = null

function getBrowserCookie(name: string) {
  if (typeof document === "undefined") return null
  return getCookieFromHeader(document.cookie, name)
}

export function getAdminCsrfHeader(): Record<string, string> {
  const token = getBrowserCookie(ADMIN_CSRF_COOKIE_KEY)
  return token ? { [ADMIN_CSRF_HEADER_KEY]: token } : {}
}

async function runRefresh() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("/api/admin/refresh", {
      method: "POST",
      credentials: "include",
      headers: getAdminCsrfHeader(),
    })

    if (response.ok) return true
    if (response.status !== 409) return false

    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  return false
}

// 동시에 만료를 감지한 요청들이 하나의 refresh 호출을 공유해 토큰 경쟁을 줄인다.
export function refreshAdminSession() {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}
