# 10-architecture

## 레이어 책임

### Query Layer
- ORM 기반 DB I/O만 담당
- 비즈니스 판단 금지

### Service Layer
- 유스케이스/정책/검증 담당
- query를 조합해 결과 생성

### Router/HTTP Layer (app 디렉토리)
- Next.js App Router(`app/**`)에서 요청/응답 맥락 처리
- params/searchParams/cookies/headers 등 HTTP 값 처리
- service 호출 후 응답/리다이렉트 결정

### Container Layer
- 클라이언트 상호작용 로직 담당
- view에 필요한 상태/핸들러 전달

### View Layer
- 순수 UI 렌더링
- 비즈니스 로직/데이터 접근 금지

## Next.js 매핑
- `app/**/page.tsx`, `route.ts` 등은 router layer 역할
- router -> service -> query 흐름 유지

## 참고
- 구조 기준: `/Users/jin/workspace/onsoa-workspace/apps/remix-web`
- 단, 구현은 Next.js App Router 방식에 맞춘다.


## 경계 강제
- feature 외부 접근은 runtime별 `index.ts` 배럴을 통해서만 허용
- 경계 위반은 `scripts/check-feature-boundaries.mjs`에서 검사


## 인프라 설정 메모 (Prisma 7)
- Prisma datasource URL은 schema가 아닌 `prisma.config.ts`에서 관리
- 애플리케이션 코드는 `src/lib/prisma.ts`를 통해 Prisma Client를 사용


### Isomorphic Layer
- `types`, `schema`와 함께 React Query `hooks`를 관리
- 클라이언트/서버 양쪽에서 참조 가능한 계약/접점 역할


### Client Component Packaging
- client는 레이어 폴더를 전역 분리하지 않고, UI 기능 단위로 코로케이션한다
- 예: `client/LoginForm/LoginFormContainer.tsx`, `client/LoginForm/LoginFormView.tsx`
- 공개 경로는 `client/index.ts` 배럴로 통일한다


## server 파일 배치
- feature server는 디렉토리 분리(query/service/prefetch) 대신 파일 접미사로 역할을 구분
- 예: `auth.query.ts`, `auth.service.ts`, `home.prefetch.ts`


## server barrel (00-conventions aligned)
- feature server의 공개 API는 `*.service.ts`, `*.prefetch.ts`만 노출한다
- `*.query.ts`는 내부 구현으로 취급하며 배럴 export를 금지한다
- server index는 네임스페이스 export를 사용한다 (`* as ...Service`, `* as ...Prefetch`)
