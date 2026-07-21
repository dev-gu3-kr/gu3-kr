import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { contentImageService } from "@/features/content-images/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isAuthorized(request: Request, secret: string) {
  const actual = Buffer.from(request.headers.get("authorization") ?? "")
  const expected = Buffer.from(`Bearer ${secret}`)

  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// 외부 운영 작업만 호출할 수 있는 멱등 API로 백필과 오래된 미연결 이미지 정리를 수행한다.
export async function POST(request: Request) {
  const secret = process.env.CONTENT_IMAGE_CLEANUP_SECRET

  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "이미지 정리 비밀키가 설정되지 않았습니다." },
      { status: 503 },
    )
  }

  if (!isAuthorized(request, secret)) {
    return NextResponse.json(
      { ok: false, message: "인증에 실패했습니다." },
      { status: 401 },
    )
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action") ?? "cleanup"
  const dryRun = searchParams.get("dryRun") === "true"
  const takeParam = Number(searchParams.get("take") ?? "500")
  const take = Number.isFinite(takeParam)
    ? Math.min(Math.max(Math.trunc(takeParam), 1), 500)
    : 500

  if (action === "backfill") {
    const result = await contentImageService.backfillExistingImages({
      cursor: searchParams.get("cursor") || undefined,
      take: Math.min(take, 100),
      dryRun,
    })

    return NextResponse.json(
      { ok: result.failed === 0, action, ...result },
      { status: result.failed === 0 ? 200 : 500 },
    )
  }

  if (action !== "cleanup") {
    return NextResponse.json(
      { ok: false, message: "지원하지 않는 이미지 유지보수 작업입니다." },
      { status: 400 },
    )
  }

  const configuredHours = Number(
    process.env.CONTENT_IMAGE_PENDING_TTL_HOURS ?? "24",
  )
  const olderThanHours = Number.isFinite(configuredHours)
    ? Math.min(Math.max(configuredHours, 1), 24 * 30)
    : 24

  const result = await contentImageService.cleanupAbandonedImages({
    olderThanHours,
    take,
    dryRun,
  })

  return NextResponse.json(
    { ok: result.failed === 0, action, ...result },
    { status: result.failed === 0 ? 200 : 500 },
  )
}
