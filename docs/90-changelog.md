# 90-changelog

## 2026-07-21
- 본문/대표 이미지 즉시 업로드를 `ContentImageAsset`의 `PENDING`/`ATTACHED` 상태로 추적
- 추적 기능 도입 전 게시물의 본문/대표 이미지를 `ATTACHED`로 복원하는 멱등 백필 API와 컨테이너 실행 스크립트 추가
- 게시물 저장·수정·삭제 시 실제 이미지 참조와 추적 상태를 동기화하고 제거 자산을 MinIO에서 정리
- 24시간 이상 된 미연결 이미지를 삭제하는 보호된 내부 API와 Synology 작업 스케줄러 실행 스크립트 추가

## 2026-02-27
- AI 작업 규칙을 `AGENTS.md`로 정리
- feature-first + layer 구조 컨벤션 문서화
- Next.js 기준 router/service/query/container/view 역할 분리 정의

- features runtime(`server/client/isomorphic`)의 index.ts 배럴 공개 규칙 추가
- deep import 차단 스크립트(`boundary:check`) 추가

- Node 셸 컨텍스트 이슈 정리: `bash -lc`(v22.11) 대신 `zsh -lc`(v24.x) 사용
- Prisma 7 구성으로 전환 (`prisma.config.ts` 도입, schema datasource url 제거)

- 아키텍처 조정: router/http는 app 디렉토리에서만 처리하도록 규칙 변경
- isomorphic 레이어에 React Query hooks 포함 규칙 추가

- client 구조를 전역 container/view 분리에서 컴포넌트 단위 코로케이션으로 변경

- server 구조를 query/service 폴더 분리에서 파일 나열(`*.query.ts`, `*.service.ts`) 방식으로 변경

- server 배럴을 service-only 네임스페이스 export로 변경(query export 금지)

- 세션 시작 체크리스트 추가(AGENTS + 핵심 docs + 관련 skills 선독)
