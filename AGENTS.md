# AGENTS.md

이 저장소에서 AI(너/다른 에이전트)가 따라야 하는 최소 규칙.

## 목적
- 성당 홈페이지를 빠르게 개발한다.
- 과한 문서보다 실행 가능한 산출물 우선.
- 구조 일관성을 유지한다.

## 아키텍처 원칙 (필수)
레이어를 아래 의미로 고정한다.

- **query layer**: DB ORM 객체로 데이터를 조회/저장하는 함수 모음
- **service layer**: query 함수를 조합해 비즈니스 로직 구현
- **router/http layer**: `app/` 디렉토리에서 처리 (feature 내부 별도 router 디렉토리 두지 않음)
- **container layer**: client 기능(상태/액션/유즈케이스) 조립
- **view layer**: 순수 UI/디자인 컴포넌트
- client 구현은 컴포넌트 단위 코로케이션(예: `LoginForm/LoginFormContainer.tsx`, `LoginForm/LoginFormView.tsx`)을 기본으로 한다

## 디렉토리 컨벤션 (필수)
- `src/features/[관심사]/[server|client|isomorphic]/**`
- 관심사(feature) 단위로 응집
- 공용 타입/스키마/상수는 `isomorphic`에 둔다

예시:

```text
src/features/auth/
  server/
    auth.query.ts
    auth.service.ts
  client/
    container/
    view/
  isomorphic/
    types/
    schema/
    hooks/
```

## 의존 규칙
- service -> query: 허용
- app(router/http) -> service: 허용
- container -> (router 결과/액션): 허용
- view -> container props: 허용
- query -> service: 금지
- view -> query/service 직접 접근: 금지

## 우선 개발 범위
1. `/` (홈)
2. `/admin/login` (로그인)
3. `/admin` 보호 진입

## 완료 기준 (DoD)
- 컨벤션 위반 없음
- `pnpm lint` 통과
- 변경 설명에 확인 경로(URL) 포함


## 공용 UI 컴포넌트
- feature 레이어에 속하지 않는 기본 UI는 `src/components`에 둔다
- shadcn 생성 컴포넌트는 `src/components/ui`를 기본으로 사용


## Feature 공개 규칙 (배럴 강제)
- `src/features/[관심사]/[server|client|isomorphic]/index.ts`를 공개 진입점으로 사용한다
- features 외부에서는 위 `index.ts` 경유 import만 허용한다
- 하위 구현 파일(deep import) 직접 참조는 금지한다
- 검증은 `pnpm run boundary:check`로 수행한다


## 실행 셸/Node 버전 규칙
- 원격 실행은 `zsh -lc` 기준으로 수행한다
- Node 기준 버전은 v24.x를 사용한다
- `bash -lc` 실행 시 Node v22.11이 잡힐 수 있으므로 사용하지 않는다


## Prisma 7 규칙
- Prisma 7 사용 시 `prisma/schema.prisma`의 datasource에 `url`을 두지 않는다
- 연결 URL은 `prisma.config.ts`의 `datasource.url = env("DATABASE_URL")`로 관리한다


## Skills(프로젝트용)
- `cat-quality-gate`: validate(check+typecheck+boundary) 품질 게이트
- `cat-react-query-audit`: React Query 키/무효화/워터폴 점검
- `cat-nextjs-data-boundary-check`: Next.js 레이어/경계 점검
- `cat-context7-cache-map`: Context7 libraryId 매핑 캐시 유지
- `cat-systematic-debugging`: 재현 기반 디버깅 절차
- `cat-frontend-ui`: UI 컨벤션(shadcn, view/container, deep import 금지)

## Skills 위치
- `docs/codex-skills/*/SKILL.md`


## isomorphic 확장 규칙
- isomorphic에는 `types`, `schema`뿐 아니라 React Query `hooks`도 포함한다
- hook은 feature의 공개 API로 간주하며 배럴(index)로 노출한다


## server 파일 배치 규칙
- server는 query/service를 폴더로 나누지 않고 파일 단위로 나열한다
- 예: `auth.query.ts`, `auth.service.ts`


## server 배럴 노출 규칙
- server 배럴(`server/index.ts`)에서는 query를 직접 export하지 않는다
- service만 `as` 네임스페이스 객체로 export 한다
- 예: `import * as authService from "./auth.service"; export { authService }`


## 세션 시작 체크리스트 (필수)
새 컨텍스트/새 세션이 시작되면 작업 전에 아래 문서를 먼저 읽는다.
1. `AGENTS.md`
2. `docs/00-conventions.md`
3. `docs/10-architecture.md`
4. `docs/90-changelog.md`
5. `docs/codex-skills/*/SKILL.md` (현재 작업과 관련된 스킬 우선)

## 세션 시작 작업 규칙
- 위 문서를 읽기 전에는 코드 수정을 시작하지 않는다.
- 규칙이 충돌하면 `AGENTS.md`를 우선으로 따른다.

## 변경 후 검증(추가 규칙)
- `src/**` 코드를 수정한 경우, 마무리 전에 반드시 `pnpm run validate`를 실행한다.
- validate 실패 시 코드를 그대로 넘기지 않는다.


## 데이터 계층 운영 규칙 (추가)
- 신규 화면은 **React Query + API 경유**를 기본으로 구현한다.
- `app/page.tsx`에서 feature `server` service를 직접 호출하는 패턴은 신규 도입 금지
  - 기존 코드는 점진적으로 API + React Query로 이관한다.
- 리스트/상세/인피니티 스크롤은 같은 query key 체계로 관리한다.
- mutation 후에는 반드시 관련 key invalidate를 수행한다.


## DTO 경계 규칙 (추가)
- `app/api/**`는 외부 계약 계층이다. Prisma 타입을 직접 응답으로 사용하지 않는다.
- DTO는 `src/features/<feature>/isomorphic/types`에 정의하고, API/페이지/컨테이너가 공통 사용한다.
- server 레이어 결과는 API 라우트에서 DTO로 매핑한 뒤 반환한다.


## 품질 게이트 - 경고 0 원칙
- `validate` 결과는 경고/오류 없이 0 상태를 목표로 한다.
- 경고가 발생하면 작업 완료로 간주하지 않고 우선 해소한다.
- 임시 무시는 예외적으로만 허용하며, 사유와 추적 항목을 남긴다.


## Codex Skills - Form
- 폼 작업(작성/수정/설정/필터)은 `docs/codex-skills/cat-notices-form-rules/SKILL.md` 규칙을 우선 적용한다.

## React Query 배치/키 관리 규칙 (강화)
- React Query 훅은 반드시 `src/features/<feature>/isomorphic/hooks/**` 아래에 작성한다.
- Query Key는 반드시 `src/features/<feature>/isomorphic/queryKeys/**`에서 중앙 관리한다.
- `client` 레이어에서는 `useQuery`/`useInfiniteQuery`를 직접 선언하지 않고, `isomorphic/hooks`의 훅만 사용한다.
- 훅/키는 `isomorphic/index.ts` 배럴을 통해서만 외부에 노출한다(딥 임포트 금지).
- 신규/리팩터링 시 기존에 `client`에 흩어진 React Query 코드는 위 구조로 함께 정리한다.


## isomorphic 파일 단일화 규칙 (강제)
- isomorphic 내부는 디렉토리 분할(`hooks/`, `queryKeys/`, `schema/`, `types/`)을 기본으로 사용하지 않는다.
- feature별로 아래 단일 파일 규칙을 사용한다.
  - `isomorphic/<feature>.hooks.ts`: React Query hooks + query keys를 같은 파일에 함께 둔다.
  - `isomorphic/<feature>.schema.ts`: zod 등 스키마 정의를 둔다.
  - `isomorphic/<feature>.types.ts`: DTO/타입 정의를 둔다.
- `isomorphic/index.ts`는 위 3개 파일만 배럴 export 한다.
- 신규 구현 및 리팩터링 시 기존 분산 구조는 위 단일 파일 구조로 통합한다.

## 주석 품질 규칙 (강화)
- 템플릿성/반복형 주석은 금지한다.
- 주석은 함수의 목적, 계약(입력/출력/실패), 부작용(API 호출/라우팅/스토리지 변경) 중심으로 작성한다.
- 코드만 읽으면 자명한 내용(한 줄 번역/함수명 반복 설명)은 주석으로 쓰지 않는다.
- 리팩터링 시 코드와 불일치하는 기존 주석은 반드시 삭제하거나 동기화한다.

## 타입 주석 규칙 (강화)
- `isomorphic/<feature>.types.ts`는 필드 인라인 주석(`type // comment`) 방식을 유지한다.
- DTO 선언 위에는 1줄 목적 주석을 두고, 필드에는 nullable/optional 의미와 포맷(예: ISO datetime)을 우선 설명한다.
- 정렬 공백으로 컬럼 맞춤을 시도하지 않는다(포매터 기본 출력 준수).
