import { NextResponse } from "next/server"
import { homeService } from "@/features/home/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const response = await homeService.getHomePage(
    requestUrl.searchParams.get("month"),
  )

  return NextResponse.json(response)
}
