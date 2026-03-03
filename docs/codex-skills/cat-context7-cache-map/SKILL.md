---
name: cat-context7-cache-map
description: 라이브러리 문서 조회 효율화를 위해 package->context7 libraryId 매핑을 docs/work/context7-map.json에 유지한다. 같은 라이브러리 문서를 반복 조회할 때 사용한다.
---

# cat-context7-cache-map

## 파일
- `docs/work/context7-map.json`

## 절차
1. package.json에서 패키지/버전 확인
2. 매핑 파일에서 libraryId 확인 후 바로 조회
3. 없으면 resolve-library-id로 찾고 매핑 파일에 추가

## 원칙
- 캐시는 libraryId 매핑만 저장
- 문서 본문은 캐시하지 않음
