const secret = process.env.CONTENT_IMAGE_CLEANUP_SECRET
const endpoint =
  process.env.CONTENT_IMAGE_BACKFILL_URL ??
  process.env.CONTENT_IMAGE_CLEANUP_URL ??
  "http://127.0.0.1:3000/api/internal/maintenance/content-images"
const dryRun = process.env.CONTENT_IMAGE_BACKFILL_DRY_RUN === "true"

if (!secret) {
  throw new Error("CONTENT_IMAGE_CLEANUP_SECRET is required.")
}

const totals = {
  scannedPosts: 0,
  discovered: 0,
  created: 0,
  attached: 0,
  unchanged: 0,
  metadataFallbacks: 0,
  failed: 0,
}
let cursor

do {
  const url = new URL(endpoint)
  url.searchParams.set("action", "backfill")
  url.searchParams.set("take", "100")
  if (dryRun) url.searchParams.set("dryRun", "true")
  if (cursor) url.searchParams.set("cursor", cursor)

  const response = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(10 * 60 * 1000),
  })
  const responseText = await response.text()
  const result = JSON.parse(responseText)

  if (!response.ok || result.ok !== true) {
    throw new Error(
      `Content image backfill failed (${response.status}): ${responseText}`,
    )
  }

  for (const key of Object.keys(totals)) {
    totals[key] += result[key] ?? 0
  }
  cursor = result.nextCursor || undefined
} while (cursor)

console.log(JSON.stringify({ ok: true, dryRun, ...totals }))
