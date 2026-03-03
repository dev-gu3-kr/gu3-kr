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
- container: `*Container.tsx`
- view: `*View.tsx`


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
- feature의 `server`에는 `query/service`만 둔다


## client 구조
- `client/container`, `client/view`를 전역 폴더로 분리하지 않는다
- 기능 단위 폴더를 만들고 그 안에 `*Container.tsx`, `*View.tsx`를 함께 둔다
- 예: `src/features/auth/client/LoginForm/{LoginFormContainer.tsx, LoginFormView.tsx}`
- feature 외부 공개는 `client/index.ts` 배럴을 통해서만 한다


## server 구조
- `server/query`, `server/service` 폴더를 만들지 않는다
- server 하위에 `*.query.ts`, `*.service.ts` 파일을 직접 배치한다
- 예: `src/features/auth/server/auth.query.ts`, `src/features/auth/server/auth.service.ts`


## server 배럴 규칙
- `server/index.ts`는 `*.service.ts`만 외부에 노출
- `*.query.ts`는 내부 구현으로 취급하며 배럴 export 금지
- 서비스는 네임스페이스 export 사용
  - `import * as authService from "./auth.service"`
  - `export { authService }`
