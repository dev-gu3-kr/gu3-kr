const secret =
  process.env.GALLERY_PHOTO_WORKER_SECRET ??
  process.env.CONTENT_IMAGE_CLEANUP_SECRET
const endpoint =
  process.env.GALLERY_PHOTO_WORKER_URL ??
  "http://127.0.0.1:3000/api/internal/maintenance/gallery-photos"

if (!secret) throw new Error("GALLERY_PHOTO_WORKER_SECRET is required.")

// 서버 재시작 후에도 DB에 남은 변환 작업과 삭제 대기 파일을 같은 서비스로 복구한다.
const response = await fetch(endpoint, {
  method: "POST",
  headers: { authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(2 * 60 * 1000),
})
const result = await response.json()
if (!response.ok || !result.ok) {
  throw new Error(`Gallery photo maintenance failed (${response.status}).`)
}
console.log(JSON.stringify(result))
