import { NextResponse } from "next/server"

export function GET() {
  // 외부 의존성 없이 프로세스가 HTTP 요청에 응답할 수 있는지만 확인한다.
  return NextResponse.json(
    { status: "healthy" },
    { headers: { "Cache-Control": "no-store" } },
  )
}
