# 행사 사진 운영

행사 사진은 `Post(category=GALLERY)`에 연결된 `GalleryPhoto`에만 등록한다. 연도별 `ArchivePhoto`에는 등록하거나 자동 연결하지 않는다. 원본 저장소와 변환 코드는 재사용하지만 등록·공개·권한·query key는 행사 사진 전용이다.

## 화면

- 등록: `/admin/gallery/new`에서 글을 저장하면 수정 화면으로 이동한다.
- 다중 업로드·사진 관리: `/admin/gallery/<id>` 또는 `/admin/gallery/<id>/edit`의 행사 사진 영역.
- 공개: `/notice/gallery/<id>`의 본문 아래 행사 사진 영역.
- 사진 공유: `/notice/gallery/<id>?photo=<photoId>`.
- 사진 아카이브: `/parish/photo-archive`에 행사 사진이 섞이지 않는다.

한 묶음은 최대 100장, 파일당 100MiB, 묶음 전체 2GiB다. 행사 전체 사진 수에는 제한이 없으며 여러 묶음으로 등록한다. 원본 전송은 브라우저에서 최대 3개를 병렬 처리한다. 사진은 기본 숨김이며, 글과 사진이 모두 공개인 경우에만 공개 API에서 조회된다. 목록은 썸네일을 48장씩 커서로 조회하고, 확대 보기의 이전·다음은 아직 로드하지 않은 페이지까지 이동한다.

## DB

`20261006120000_add_gallery_photos`는 기존 글·파일·아카이브 데이터를 유지하며 테이블과 컬럼을 추가한다.

```sh
pnpm exec prisma migrate deploy
pnpm run db:generate
```

| 테이블 | 역할 |
|---|---|
| `GalleryPhoto` | 소속 글, 공개 상태, 표시 순서, 설명, 원본·표시본·썸네일 자산 FK |
| `GalleryUploadBatch` | 등록 관리자와 행사에 소속된 업로드 묶음 |
| `GalleryUploadItem` | 파일별 전송·변환 상태, 원본 FK, 결과 사진 FK, 오류, 시도 횟수와 lease |
| `FileAsset` | 실제 MinIO 객체와 메타데이터, 실패한 행사 파일 정리 대상 표시 |

사진 순서는 묶음 생성 시 게시글 행을 잠그고 범위를 예약한다. 재전송에 같은 묶음·파일 UUID를 사용하고, 같은 행사에서 같은 원본 체크섬을 중복 등록하지 못하게 DB unique 제약을 둔다. 다른 행사 또는 사진 아카이브의 같은 사진은 이 제약에 포함하지 않는다.

## 저장소·변환

- 원본: `MINIO_GALLERY_ORIGINAL_BUCKET`, 미설정이면 기존 비공개 `MINIO_ARCHIVE_ORIGINAL_BUCKET`을 사용한다.
- 표시본·썸네일: 기존 `MINIO_PUBLIC_IMAGE_BUCKET`과 `MINIO_PUBLIC_BASE_URL`을 사용한다.
- 행사 사진 객체 키는 `gallery-photos/<postId>/<uploadItemId>/<leaseToken>/...`다.
- 원본 바이트는 유지하고 확대 보기용 최대 2560px WebP와 목록용 최대 640px WebP를 별도로 생성한다.
- 원본 URL과 내부 저장소 주소는 공개 DTO에 포함하지 않는다.

`WAITING → UPLOADING → QUEUED → PROCESSING → COMPLETED` 상태를 기록하며 실패는 `FAILED`, 취소는 `CANCELLED`다. 원본 전송이 끝나지 않은 작업은 파일을 다시 선택해 이어서 전송한다. 원본이 보존된 실패 작업은 서버에서 재시도한다. 변환 작업은 DB advisory lock과 10분 lease로 전체 최대 3개를 제한하고, 만료된 작업을 최대 3회 회수한다. 오래된 작업자는 lease token 검증 때문에 새 작업의 결과를 덮어쓸 수 없다.

업로드·재시도 응답 후 Next.js `after()`가 DB 대기열을 처리한다. 관리자 작업 상태 조회도 남은 변환을 재개한다. 관리자 화면을 열지 않는 시간에도 서버 재시작 복구와 파일 정리를 진행하려면 아래 스크립트를 기존 서버 스케줄러에서 1분 간격으로 실행한다. 각 호출은 45초 동안 최대 100장을 처리하며, 이미 진행 중인 작업은 중복 처리하지 않는다.

```sh
node --env-file=.env scripts/process-gallery-photos.mjs
```

API는 `/api/internal/maintenance/gallery-photos`이며 `GALLERY_PHOTO_WORKER_SECRET`을 요구한다. 미설정이면 기존 `CONTENT_IMAGE_CLEANUP_SECRET`을 사용한다. 별도 서버 주소는 `GALLERY_PHOTO_WORKER_URL`로 지정한다. 비밀키를 로그·명령행 인수에 넣지 않는다.

## 삭제·회수

사진 삭제는 공개 연결을 먼저 제거하고 원본·표시본·썸네일을 정리한다. 게시글 삭제는 사진과 업로드 작업을 함께 제거하고 사용했던 자산에 `galleryCleanupPending`을 남긴다. 파일 삭제 실패는 레코드를 남겨 재시도하며, 유지보수 작업은 생성 후 24시간이 지난 미사용 정리 대상 자산을 한 번에 100개씩 처리한다. 원본 회수는 재시도와 같은 잠금으로 직렬화해 작업 중인 원본을 삭제하지 않는다.

사진 아카이브와 게시글 본문 파일 정리는 행사 사진 사용처를 보호한다. 숨김 상태는 화면/API의 노출 상태이며, 이미 공유된 공개 표시 파일 URL을 폐기하는 기능은 아니다.
