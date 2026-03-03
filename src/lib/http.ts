import { headers } from "next/headers"

export async function getBaseUrl() {
  // 서버 런타임에서는 요청 헤더를 기준으로 절대 URL을 구성한다.
  const headerStore = await headers()
  const protocol = headerStore.get("x-forwarded-proto") ?? "http"
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")

  if (host) {
    return `${protocol}://${host}`
  }

  // 헤더가 없을 때(빌드/특수 런타임) 로컬 기본값으로 폴백한다.
  return "http://localhost:3000"
}
