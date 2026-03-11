# Cathedral Website ERD (v1)

## 핵심 엔티티
- **User**: 관리자 계정(권한 포함)
- **Post**: 공지/주보/갤러리/청소년블로그 공통 게시글
- **Attachment**: 주보 파일(PDF/HWP 등) 및 게시글 첨부
- **GalleryImage**: 갤러리 게시글의 다중 이미지
- **Event**: 본당 일정(달력/다가오는 일정)
- **MassSchedule**: 미사시간 고정/반고정 콘텐츠
- **ClergyProfile**: 신부님/수녀님 소개
- **PastoralCouncilMember**: 사목협의회 인원
- **Inquiry**: 1:1 문의 (단일 processingMemo 필드)

## 관계
- User 1:N Post
- Post 1:N Attachment
- Post 1:N GalleryImage
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
- 갤러리는 `Post + GalleryImage` 구조로 대표이미지(isCover) 지원
- 1:1 문의는 공개답변 대신 Inquiry 단일 `processingMemo` 필드로 내부 처리 메모 관리
