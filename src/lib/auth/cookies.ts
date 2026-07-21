export const ADMIN_ACCESS_COOKIE_KEY = "cathedral_admin_access"
export const ADMIN_REFRESH_COOKIE_KEY = "cathedral_admin_refresh"
export const ADMIN_CSRF_COOKIE_KEY = "cathedral_admin_csrf"

export type AuthCookieMutation = {
  name: string
  value: string
  options: {
    httpOnly: boolean
    sameSite: "lax"
    secure: boolean
    maxAge: number
    path: string
  }
}

export function getRequestCookie(request: Request, name: string) {
  return getCookieFromHeader(request.headers.get("cookie") ?? "", name)
}

// Cookie 헤더의 값에 등호가 포함되어도 손실 없이 지정 쿠키만 복원한다.
export function getCookieFromHeader(cookieHeader: string, name: string) {
  for (const part of cookieHeader.split(";")) {
    const [rawName, ...rawValue] = part.trim().split("=")
    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="))
    }
  }

  return null
}

export function buildAuthCookie(
  name: string,
  value: string,
  maxAge: number,
  httpOnly = true,
): AuthCookieMutation {
  return {
    name,
    value,
    options: {
      httpOnly,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
      path: "/",
    },
  }
}

export function clearAuthCookie(name: string, httpOnly = true) {
  return buildAuthCookie(name, "", 0, httpOnly)
}
