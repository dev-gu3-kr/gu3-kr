# 00-conventions

## 기술 스택
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- pnpm

## 명령어
```bash
pnpm install
pnpm dev
pnpm lint
```

## 기본 구조
- Feature-first: `src/features/[domain]/[server|client|isomorphic]/**`

### server
- `query/` : DB 접근
- `service/` : 비즈니스 로직
- HTTP/route context는 feature 내부가 아닌 `app/`에서 처리

### client
- `container/` : 상태/이벤트/액션 조립
- `view/` : 프레젠테이션 전용 컴포넌트

### isomorphic
- `types/`, `schema/`, `hooks/`, `constants/` 등 공용 모듈

## 공용 UI 컴포넌트
- 레이어 외의 아주 기본 UI는 `src/components`에서 관리
- shadcn 기본 컴포넌트 생성 위치도 `src/components/ui` 사용

## 라우트 규칙
- `/` : 홈
- `/admin/login` : 로그인
- `/admin` : 인증 필요 영역

## 네이밍
- query: `*.query.ts`
- service: `*.service.ts`
- prefetch: `*.prefetch.ts` (SSR prefetch 전용)
- container: `*Container.tsx`
- view: `*View.tsx`

### server 네임스페이스 export 네이밍
- `*.service.ts` → `<domain>Service` (예: `noticeService`)
- `*.prefetch.ts` → `<domain>Prefetch` (예: `homePrefetch`)
- 중복 접미사 금지 (`homePrefetchService` 지양)


## Feature 배럴(export) 규칙
- 각 feature runtime 폴더(`server`, `client`, `isomorphic`)는 `index.ts`를 공개 진입점으로 사용
- features 외부 import는 아래 형태만 허용
  - `@/features/<feature>/server`
  - `@/features/<feature>/client`
  - `@/features/<feature>/isomorphic`
- deep import(예: `@/features/auth/server/service/login.service`) 금지
- 검증 스크립트: `pnpm run boundary:check`


## 실행 환경 주의사항
- 원격 명령은 `zsh -lc`를 사용한다
- Node 버전은 v24.x 기준
- `bash -lc`는 `/usr/local/bin/node`(v22.11)로 실행될 수 있음


## Prisma 7 설정
- `prisma/schema.prisma` datasource에는 `url` 미기재
- `prisma.config.ts`에서 `datasource.url = env("DATABASE_URL")` 설정
- DB URL 미설정 상태에서도 `prisma generate`까지는 가능


## HTTP 레이어 위치
- router/http 레이어는 `app/` 디렉토리에서만 처리
- feature의 `server`에는 `*.query.ts`, `*.service.ts`, `*.prefetch.ts` 파일만 둔다


## client 구조
- `client/container`, `client/view`를 전역 폴더로 분리하지 않는다
- 기능 단위 폴더를 만들고 그 안에 `*Container.tsx`, `*View.tsx`를 함께 둔다
- 예: `src/features/auth/client/LoginForm/{LoginFormContainer.tsx, LoginFormView.tsx}`
- feature 외부 공개는 `client/index.ts` 배럴을 통해서만 한다


## server 구조
- `server/query`, `server/service` 폴더를 만들지 않는다
- server 하위에 `*.query.ts`, `*.service.ts`, `*.prefetch.ts` 파일을 직접 배치한다
- 예: `src/features/auth/server/auth.query.ts`, `src/features/auth/server/auth.service.ts`, `src/features/home/server/home.prefetch.ts`


## server 배럴 규칙
- `server/index.ts`은 `*.service.ts`, `*.prefetch.ts`만 외부에 노출
- `*.query.ts`는 내부 구현으로 취급하며 배럴 export 금지
- namespace export 사용
  - `import * as authService from './auth.service'`
  - `import * as homePrefetch from './home.prefetch'`
  - `export { authService, homePrefetch }`

## 주석 작성 컨벤션
- 원칙: 앞으로 작성/수정하는 모든 코드에는 의도를 설명하는 주석을 포함한다.
- 필드/속성 정의가 많은 파일(예: Prisma schema)은 각 필드 위에 1줄 주석을 단다.
- 주석은 '무엇'보다 '왜/의도'를 우선 설명한다.
- 자명한 코드 반복 설명은 피하고, 도메인 규칙/제약/운영 정책을 명시한다.
- 리팩터링 시 기존 주석이 코드와 불일치하면 코드와 함께 즉시 갱신한다.

## 변경 후 검증 규칙
- `src/**` 하위 코드가 수정되면 작업 종료 전에 반드시 `pnpm run validate`를 실행한다.
- 검증 실패 상태에서는 작업 완료로 간주하지 않는다.
- 검증 출력의 오류/경고는 원인과 함께 정리해 공유한다.


## 데이터 접근 규칙 (React Query + API 표준)
- 원칙: **페이지/컴포넌트에서 feature service를 직접 호출하지 않는다.**
- 데이터 조회/수정은 `app/api/**` 라우트 핸들러를 단일 진입점으로 사용한다.
- feature `server` 레이어(`*.service.ts`, `*.query.ts`)는 API 라우트 내부에서만 사용한다.

### 조회(Read)
- 클라이언트 조회는 React Query(`useQuery`, `useInfiniteQuery`)를 기본으로 한다.
- SSR이 필요한 화면은 서버에서 prefetch 후 hydration을 사용한다.
- 같은 리소스는 동일 query key 규칙을 사용한다.

### 변경(Write)
- 생성/수정/삭제는 React Query mutation을 사용한다.
- mutation 성공 시 관련 query key를 invalidate하여 목록/상세를 동기화한다.

### 라우팅 훅 사용 위치
- `useRouter`, `usePathname`, `useSearchParams`는 **client container** 또는 `app/**` client 경계에서만 사용한다.
- `*View.tsx`(순수 view)에서는 라우팅 훅을 사용하지 않는다.

### 금지
- `src/app/**/page.tsx`에서 `@/features/*/server`의 `*Service` 직접 호출 금지
- view 레이어에서 API 호출/라우팅 훅 직접 사용 금지


## SSR page.tsx prefetch 규칙
- SSR 페이지(`src/app/**/page.tsx`)는 hydration 목적의 `@/features/<feature>/server`의 `*Prefetch` namespace import를 허용한다.
- page.tsx 에서는 `prefetch*` 함수만 호출하고, 도메인 비즈니스 로직(`*Service`) 호출은 금지한다.
- prefetch 로직은 `src/features/<feature>/server/*.prefetch.ts`에 두고, query key / prefetchQuery / prefetchInfiniteQuery 구성만 책임진다.
- `*.prefetch.ts`는 side effect(입력 수정, DB write)를 가지지 않는다.

## API 경계 DTO 규칙
- API 경계(`app/api/**`)에서는 Prisma 모델 타입을 직접 응답 계약으로 노출하지 않는다.
- API 요청/응답 타입은 feature의 `isomorphic/types`에 DTO로 정의한다.
  - 예: `NoticeDetailDto`, `NoticePageDto`, `ApiResponseDto<T>`
- 서버(service/query)에서 나온 모델/엔티티는 API 라우트에서 DTO로 매핑 후 반환한다.
- 페이지/컨테이너는 로컬 임시 타입 선언보다 `isomorphic` DTO import를 우선한다.
- 시간/날짜 필드(`Date`)는 API 응답에서 직렬화 가능한 문자열(ISO)로 변환해 DTO와 일치시킨다.


## 경고 0(Zero Warning) 원칙
- 기본 원칙: `pnpm run validate` 기준 **경고/오류 0** 상태를 유지한다.
- 작업 완료 보고 전, 새로 추가된 경고를 반드시 제거한다.
- 불가피하게 남겨야 하는 경고가 있으면 근거/영향/해결 계획을 문서 또는 코멘트로 남긴다.
- `check`(Biome) 경고도 실패로 간주하고 즉시 수정한다.
