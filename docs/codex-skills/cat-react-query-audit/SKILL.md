---
name: cat-react-query-audit
description: cathedral-nextjs의 React Query 사용을 점검해 queryKey, enabled 조건, invalidation, 중복 fetch/워터폴을 개선한다. useQuery/useMutation 패턴 점검 시 사용한다.
---

# cat-react-query-audit

## 점검 항목
1. queryKey 일관성(키 팩토리 사용)
2. enabled 누락 여부(Boolean(id) 등)
3. 중복 호출/워터폴
4. mutation 후 invalidate 범위 과다 여부
5. staleTime/gcTime 적정성

## 산출물
- 점검 파일 경로
- 문제 후보 + 근거
- 권장 수정안
- 마무리: `pnpm run validate`
