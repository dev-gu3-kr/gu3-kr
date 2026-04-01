import { NextResponse } from "next/server"
import type { ApiResponseDto } from "@/features/intro-posts/isomorphic"
import { introPostsService } from "@/features/intro-posts/server"

const SECTION = "community" as const

export async function GET() {
  const items = await introPostsService.getIntroPosts({
    section: SECTION,
    isPublished: true,
  })

  const response: ApiResponseDto<{ items: typeof items }> = {
    ok: true,
    items,
  }

  return NextResponse.json(response)
}
