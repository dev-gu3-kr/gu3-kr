---
name: cat-frontend-ui
description: cathedral-nextjs UI 작업 규칙(shadcn/ui 우선, src/components 공용 UI, client 코로케이션, deep import 금지)을 적용해 컴포넌트를 구현/수정할 때 사용한다.
---

# cat-frontend-ui

## 규칙
- 기본 UI: `src/components`, shadcn: `src/components/ui`
- feature client는 컴포넌트 단위 코로케이션 사용
  - 예: `src/features/auth/client/LoginForm/{LoginFormContainer.tsx, LoginFormView.tsx}`
- feature 외부 공개는 `client/index.ts` 배럴 경유
- deep import 금지(배럴 경유)

## 작업 순서
1. 기존 UI 재사용 여부 확인
2. 컴포넌트 단위 코로케이션으로 Container/View 구현
3. 로딩/에러/빈 상태 명시
4. 검증: `pnpm run validate`

## 추가 규칙
- isomorphic에는 React Query hooks를 배치하고 배럴(index)로 노출한다
