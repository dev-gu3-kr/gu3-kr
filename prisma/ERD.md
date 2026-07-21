# Cathedral Website ERD (v1)

## 핵심 엔티티
- **User**: 관리자 계정(권한 포함)
- **Post**: 공지/주보/갤러리/청소년블로그 공통 게시글
- **FileAsset**: MinIO에 저장된 이미지·문서의 단일 물리 파일 메타데이터
- **PostAsset**: 게시글 파일의 본문·대표·첨부 역할과 정렬 순서
- **Event**: 본당 일정(달력/다가오는 일정)
- **MassSchedule**: 미사시간 고정/반고정 콘텐츠
- **ClergyProfile**: 신부님/수녀님 소개
- **PastoralCouncilMember**: 사목협의회 인원
- **Inquiry**: 1:1 문의 (단일 processingMemo 필드)

## 관계
- User 1:N Post
- User 1:N FileAsset
- Post 1:N PostAsset
- FileAsset 1:N PostAsset
- User 1:N Event

## 카테고리 정책
- Post.category
  - NOTICE
  - BULLETIN
  - GALLERY
  - YOUTH_BLOG

## 권한 정책(초안)
- User.role
  - SUPER_ADMIN: 사용자 관리 + 문의 조회/처리 + 전체 관리
  - ADMIN: 대부분의 콘텐츠 관리
  - EDITOR: 게시글/일정/콘텐츠 편집
  - VIEWER: 읽기 전용(백오피스 검토)

## 설계 메모
- 정적 성격 페이지는 현재 하드코딩/코드 관리 대상으로 유지
- 파일 원본은 `FileAsset`에 한 번만 저장하고 `PostAsset.role`로 `CONTENT`, `COVER`, `ATTACHMENT` 역할을 구분한다.
- 1:1 문의는 공개답변 대신 Inquiry 단일 `processingMemo` 필드로 내부 처리 메모 관리
