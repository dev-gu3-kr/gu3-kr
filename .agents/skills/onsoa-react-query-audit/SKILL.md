---
name: onsoa-react-query-audit
description: onsoa-nextjs의 TanStack React Query v5 사용을 감사하고 수정한다. query key, enabled 조건, 중복 요청과 워터폴, invalidate/refetch 범위, optimistic update, staleTime/gcTime, 서버 렌더링과의 중복을 점검할 때 사용한다.
---

# Onsoa React Query Audit

## 범위 찾기

1. `package.json`에서 TanStack Query 버전을 확인한다.
2. `src/features/**/{client,isomorphic}`와 client 컴포넌트에서 `useQuery`, `queryOptions`, `useMutation`, `useInfiniteQuery`, `invalidateQueries`, `refetchQueries`, `setQueryData`를 검색한다.
3. 관련 `src/app/api/**/route.ts`, Server Action, feature server service까지 요청 경로를 추적한다.
4. API 동작이 불확실하면 설치된 버전의 공식 문서 또는 프로젝트에 제공된 최신 문서를 확인한다.

## 우선순위 점검

1. **키의 정체성**
   - 같은 리소스는 공용 key factory를 사용하고, 응답을 바꾸는 모든 인자를 key에 포함한다.
   - 서로 다른 사용자·클럽·필터의 데이터가 같은 key를 공유하지 않게 한다.
2. **실행 조건**
   - 필수 id나 인증 상태가 없을 때 queryFn이 호출되지 않게 `enabled` 또는 적절한 v5 패턴을 사용한다.
   - 빈 문자열이나 임시 id를 실제 리소스 key처럼 사용하지 않는다.
3. **중복과 워터폴**
   - Server Component fetch와 hydration 이후 client fetch가 의도 없이 겹치는지 확인한다.
   - 독립 쿼리를 불필요하게 순차 실행하지 않는다.
   - 같은 endpoint를 여러 컴포넌트가 서로 다른 key로 호출하지 않게 한다.
4. **mutation 후 일관성**
   - mutation 결과로 정확히 갱신할 수 있으면 `setQueryData`를 검토하고, invalidate는 영향을 받는 key 범위로 제한한다.
   - 여러 invalidate/refetch가 같은 네트워크 요청을 반복하거나 오래된 응답으로 덮어쓰지 않는지 확인한다.
   - optimistic update는 cancel, snapshot, rollback, settle 흐름을 모두 갖춘다.
5. **수명과 오류**
   - 데이터 변동성과 UX에 맞춰 `staleTime`을 선택하고 `gcTime`을 데이터 신선도 설정처럼 사용하지 않는다.
   - queryFn이 오류를 성공 값으로 삼키지 않는지, 가능하면 취소 signal을 전달하는지 확인한다.
   - 로딩, 빈 값, 오류, 재시도 중 상태가 UI에서 구분되는지 확인한다.
   - refetch가 401/403 또는 네트워크 오류로 실패했을 때 이전 권한·민감 데이터와 조작 UI가 계속 노출되지 않는지 확인한다.
6. **인증과 캐시 층**
   - 로그인, 로그아웃, 계정·클럽 전환 때 사용자 범위 query가 제거되거나 올바른 key로 격리되는지 확인한다.
   - HTTP `no-store`, Next.js server cache, React Query의 `staleTime`/`gcTime`을 서로 다른 층으로 구분하고 한 설정이 다른 층까지 해결한다고 가정하지 않는다.

## 수정 원칙

- 정확성이 확인된 문제만 작게 수정한다. 캐시 옵션을 일괄 추가하지 않는다.
- query key factory를 바꾸면 모든 소비자, mutation, prefetch, invalidation을 함께 검색한다.
- Server Component로 옮기는 것이 적절한 데이터와 클라이언트 동기화가 필요한 데이터를 구분한다.
- 동작 변경에는 가까운 Vitest 테스트를 추가하거나 갱신한다.

## 결과

- 파일과 줄 단위로 문제, 사용자 영향, 근거, 권장 수정을 우선순위로 제시한다.
- 수정했다면 관련 테스트 후 `npm run verify`를 실행하고 결과를 보고한다.
- 추정인 항목과 재현으로 확인된 항목을 구분한다.
