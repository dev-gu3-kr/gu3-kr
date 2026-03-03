import { NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE_KEY } from "@/features/auth/isomorphic"

export async function POST() {
  // 로그아웃 응답 객체를 생성한다.
  const response = NextResponse.json({ ok: true })

  // 관리자 세션 쿠키를 만료시켜 로그아웃 처리한다.
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE_KEY,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}
