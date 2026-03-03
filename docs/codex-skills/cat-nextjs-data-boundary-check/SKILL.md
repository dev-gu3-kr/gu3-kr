---
name: cat-nextjs-data-boundary-check
description: Next.js App Router 기준 데이터 경계 점검. app 디렉토리의 HTTP 처리와 feature 내부 server/service-query, client 코로케이션, isomorphic(hooks 포함) 경계를 점검할 때 사용한다.
---

# cat-nextjs-data-boundary-check

## 규칙
- HTTP/router layer는 `app/*`에서만 처리
- feature server 공개 API는 service-only 배럴(`* as ...Service`)만 허용
- `*.query.ts`는 server 내부 구현으로만 사용(배럴 export 금지)
- client view는 데이터 직접 접근 금지, container props 기반 렌더링
- features 외부 import는 배럴(index) 경유만 허용

## 점검
1. app layer에서 DB 접근 직접 수행 여부
2. client component에서 server/query 직접 import 여부
3. deep import(`@/features/*/**`) 위반 여부
4. server 배럴이 query를 노출하는지 여부

## 검증
```bash
pnpm run boundary:check
pnpm run validate
```

## 추가 규칙
- isomorphic에는 React Query hooks를 배치하고 배럴(index)로 노출한다
