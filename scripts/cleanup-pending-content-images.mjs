const secret = process.env.CONTENT_IMAGE_CLEANUP_SECRET
const endpoint =
  process.env.CONTENT_IMAGE_CLEANUP_URL ??
  "http://127.0.0.1:3000/api/internal/maintenance/content-images"
const dryRun = process.env.CONTENT_IMAGE_CLEANUP_DRY_RUN === "true"

if (!secret) {
  throw new Error("CONTENT_IMAGE_CLEANUP_SECRET is required.")
}

const url = new URL(endpoint)
if (dryRun) url.searchParams.set("dryRun", "true")

// 스케줄러는 비밀키로 보호된 Next.js 정리 API만 호출하고 삭제 판단은 서비스에 위임한다.
const response = await fetch(url, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(10 * 60 * 1000),
})
const responseText = await response.text()
const result = JSON.parse(responseText)

if (!response.ok || result.ok !== true) {
  throw new Error(
    `Content image cleanup failed (${response.status}): ${responseText}`,
  )
}

console.log(responseText)
