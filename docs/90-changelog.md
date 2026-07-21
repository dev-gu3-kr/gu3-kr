# 90-changelog

## 2026-07-21
- 관리자 로그인을 이메일·비밀번호 기반 access JWT + 회전형 refresh token 방식으로 전환
- 인증 쿠키를 `HttpOnly`/`SameSite`로 보호하고 관리자 변경 API에 CSRF 검증 추가
- 신규 비밀번호를 scrypt로 저장하고 기존 SHA-256 비밀번호는 로그인 시 자동 승격
- 관리자 로그인 폼을 React Hook Form 검증과 공통 오류·토스트 처리 방식으로 정리
- `Attachment`, `PostImage`, `ContentImageAsset`의 중복 메타데이터를 `FileAsset + PostAsset` 구조로 정규화
- 기존 첨부파일·대표 이미지·본문 이미지 데이터를 역할 기반 사용처로 자동 백필하는 안전한 마이그레이션 추가
- 게시물 저장·수정·삭제 시 실제 파일 사용처를 동기화하고 제거 자산을 MinIO에서 정리
- 24시간 이상 된 미연결 이미지를 삭제하는 보호된 내부 API와 Synology 작업 스케줄러 실행 스크립트 추가
- 신규 구조의 운영 검증과 데이터 대응 검사를 거쳐 레거시 파일 테이블 및 상태 enum 제거

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
