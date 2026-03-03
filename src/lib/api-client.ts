// 쿼리 파라미터로 허용할 값 타입이다.
type QueryValue = string | number | boolean | null | undefined
// URLSearchParams로 직렬화할 쿼리 객체 타입이다.
type QueryRecord = Record<string, QueryValue>

// 클라이언트 API 요청 체이닝 빌더 타입이다.
type RequestBuilder = {
  // 쿼리 파라미터를 누적한다.
  query: (params: QueryRecord) => RequestBuilder
  // JSON 본문과 Content-Type 헤더를 설정한다.
  json: (body: unknown) => RequestBuilder
  // RequestInit을 추가 병합한다.
  init: (nextInit: RequestInit) => RequestBuilder
  // 누적된 옵션으로 최종 요청을 전송한다.
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

function createApiBuilder(method: string, path: string): RequestBuilder {
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
      return fetch(requestPath, requestInit)
    },
  }
}

// 브라우저 런타임에서 사용하는 공통 API 체이닝 엔트리다.
export const apiFetch = {
  get: (path: string) => createApiBuilder("GET", path),
  post: (path: string) => createApiBuilder("POST", path),
  put: (path: string) => createApiBuilder("PUT", path),
  del: (path: string) => createApiBuilder("DELETE", path),
}
