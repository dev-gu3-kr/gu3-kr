---
name: onsoa-next-boundaries
description: onsoa-nextjs의 Next.js 16 App Router 코드에서 Server/Client Component, Server Action, Route Handler, 캐시와 feature 계층 경계를 설계·구현·리뷰한다. use client 확산, 서버 코드 노출, 잘못된 params 처리, API 응답·인증·데이터 fetching 경계 문제를 점검할 때 사용한다.
---

# Onsoa Next Boundaries

## 근거를 먼저 읽기

1. `AGENTS.md`를 읽는다.
2. 변경할 API와 직접 관련된 `node_modules/next/dist/docs/` 가이드를 읽고 현재 Next.js 16 동작을 기준으로 판단한다. 기억에 의존하지 않는다.
3. 인접 route/page/action과 `src/features/<feature>`의 기존 구조를 확인한다.

## 경계 규칙

- `page.tsx`와 `layout.tsx`는 기본적으로 Server Component로 유지한다.
- 상태, 이벤트 핸들러, effect, 브라우저 API, 클라이언트 훅이 필요한 가장 작은 파일에만 `"use client"`를 둔다. 해당 파일의 import 그래프 전체가 클라이언트 번들에 들어감을 고려한다.
- Server Component에서 데이터를 가져오고, 직렬화 가능한 최소 props를 interactive leaf에 전달한다.
- 원칙적으로 `src/features/<feature>/{client,components,server,isomorphic}`의 공개 배럴을 사용한다. 다만 큰 `"use client"` 배럴이 정적 UI까지 client graph로 끌어들이면 기존 lint 규칙을 확인한 뒤 더 작은 공개 entry point를 설계한다. client 배럴에서 server 모듈을 재수출하거나 그 반대가 되지 않게 한다.
- 비밀값, Prisma, Redis, 서버 전용 인증 로직은 client graph에 들어가지 않게 한다.
- 동적 route의 `params`와 `searchParams`는 현재 문서의 Promise 타입을 따르고 필요한 곳에서 `await`한다.

## 쓰기와 HTTP 경계

- Server Action은 `"use server"` 경계 안에서 입력을 검증하고 인증과 권한 검사를 각각 수행한다. 기존 `src/lib/auth`와 feature service를 재사용한다.
- Server Component, Route Handler, read service도 인증만으로 충분하다고 가정하지 않는다. club/user 같은 리소스마다 membership·role·ownership 권한을 서버 경계에서 확인하고, 추측 가능한 id로 다른 사용자의 데이터가 노출되지 않게 한다.
- Route Handler는 Web `Request`/`Response` 또는 필요한 경우 `NextRequest`/`NextResponse`를 사용하고 명시적인 상태 코드와 일관된 JSON 오류 형태를 반환한다.
- Route Handler가 기본적으로 캐시되지 않는다는 현재 문서를 기준으로 하고, 캐시를 선택할 때만 의도를 코드에 드러낸다.
- UI와 API handler에 DB 규칙을 복제하지 말고 `src/features/<feature>/server` 서비스로 모은다.
- redirect, revalidation, cookie 변경 순서는 현재 문서와 기존 인증 유틸을 확인한다.

## 데이터 경계 점검

1. 같은 데이터를 Server Component와 React Query가 중복 요청하는지 확인한다.
2. 서버에서 바로 렌더링할 값인지, 지속적인 클라이언트 동기화가 필요한 값인지 구분한다.
3. 순차 await로 생긴 워터폴을 독립 호출의 병렬 실행이나 컴포넌트 분할로 줄일 수 있는지 확인한다.
4. 사용자별 데이터가 잘못 공유될 수 있는 캐시를 만들지 않는다.
5. 클라이언트에 전달되는 객체에서 불필요하거나 민감한 필드를 제거한다.
6. `useSearchParams` 같은 client routing hook을 정적 route에서 사용할 때 현재 문서의 Suspense 요구와 production build 동작을 확인한다. route가 request-time으로 동작한다면 그 근거를 확인한다.

## 검증과 보고

- 변경에 가장 가까운 테스트를 실행하고 마지막에 `npm run verify`를 실행한다.
- async Server Component의 렌더링은 필요하면 브라우저/E2E로 검증하고, 테스트 가능한 순수 로직은 분리한다.
- 결과에는 점검한 경계, 발견한 위험, 변경 파일, 실행한 검증, 남은 위험을 경로와 함께 보고한다.
