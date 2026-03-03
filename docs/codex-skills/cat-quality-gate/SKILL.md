---
name: cat-quality-gate
description: cathedral-nextjs 작업 마무리 품질 게이트. pnpm run validate(check+typecheck+boundary:check) 실행 후 실패 원인을 분류하고 수정한다.
---

# cat-quality-gate

## 목적
- 작업 마무리 시 품질 기준을 일관되게 통과한다.

## 실행
```bash
pnpm run validate
```

## 실패 대응
- check(Biome): 포맷/린트/제한 import 위반 확인
- typecheck: 타입/서버-클라 경계 타입 확인
- boundary:check: features deep import 위반 확인

## 출력 형식
- 실행 명령
- 실패 유형(check/typecheck/boundary)
- 핵심 에러 3개 요약(파일 경로)
- 수정 파일 목록
