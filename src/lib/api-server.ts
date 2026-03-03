import { cookies } from "next/headers"
import { getBaseUrl } from "./http"

// 서버 API 요청에서 허용할 쿼리 값 타입이다.
type QueryValue = string | number | boolean | null | undefined
// 서버 API 요청 쿼리 객체 타입이다.
type QueryRecord = Record<string, QueryValue>

// 서버 API 요청 체이닝 빌더 타입이다.
type ServerRequestBuilder = {
  // 쿼리 파라미터를 누적한다.
  query: (params: QueryRecord) => ServerRequestBuilder
  // JSON 본문과 Content-Type 헤더를 설정한다.
  json: (body: unknown) => ServerRequestBuilder
  // RequestInit을 추가 병합한다.
  init: (nextInit: RequestInit) => ServerRequestBuilder
  // 쿠키/절대경로를 포함해 서버 요청을 전송한다.
  send: () => Promise<Response>
}

function appendQuery(path: string, params: QueryRecord) {
  // null/undefined를 제외하고 쿼리스트링을 생성한다.
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue
    }

    searchParams.set(key, String(value))
  }

  const queryString = searchParams.toString()

  if (!queryString) {
    return path
  }

  // 기존 쿼리 존재 여부에 따라 구분자를 선택한다.
  return `${path}${path.includes("?") ? "&" : "?"}${queryString}`
}

function createServerApiBuilder(
  method: string,
  path: string,
): ServerRequestBuilder {
  // 체이닝 중 누적될 요청 경로다.
  let requestPath = path
  // 체이닝 중 누적될 요청 옵션이다.
  let requestInit: RequestInit = { method }

  return {
    query(params) {
      requestPath = appendQuery(requestPath, params)
      return this
    },
    json(body) {
      requestInit = {
        ...requestInit,
        headers: {
          ...(requestInit.headers ?? {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
      return this
    },
    init(nextInit) {
      requestInit = {
        ...requestInit,
        ...nextInit,
        headers: {
          ...(requestInit.headers ?? {}),
          ...(nextInit.headers ?? {}),
        },
      }
      return this
    },
    async send() {
      // 현재 요청 컨텍스트 쿠키를 포함해 서버 API 호출을 구성한다.
      const cookieStore = await cookies()
      // reverse proxy 환경을 포함해 절대 URL을 계산한다.
      const baseUrl = await getBaseUrl()

      return fetch(`${baseUrl}${requestPath}`, {
        ...requestInit,
        headers: {
          ...(requestInit.headers ?? {}),
          cookie: cookieStore.toString(),
        },
        // 서버 페이지 데이터는 기본적으로 최신 상태를 우선한다.
        cache: requestInit.cache ?? "no-store",
      })
    },
  }
}

// 서버 런타임에서 사용하는 공통 API 체이닝 엔트리다.
export const serverApiFetch = {
  get: (path: string) => createServerApiBuilder("GET", path),
  post: (path: string) => createServerApiBuilder("POST", path),
  put: (path: string) => createServerApiBuilder("PUT", path),
  patch: (path: string) => createServerApiBuilder("PATCH", path),
  del: (path: string) => createServerApiBuilder("DELETE", path),
}
