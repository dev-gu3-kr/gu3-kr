# 본문 이미지 자동 정리 운영

본문 및 대표 이미지 업로드는 `ContentImageAsset`에 `PENDING`으로 기록된다. 게시물을 저장하면 실제 본문/대표 이미지에서 참조하는 자산만 `ATTACHED`가 된다. 기본 유예 시간 24시간이 지난 미연결 자산은 MinIO와 DB에서 함께 삭제한다. 추적 기능 도입 전에 저장된 이미지는 배포 후 일회성 백필로 `ATTACHED` 상태를 만든다.

## 필수 런타임 환경변수

- `CONTENT_IMAGE_CLEANUP_SECRET`: 32바이트 이상의 임의 비밀값
- `CONTENT_IMAGE_PENDING_TTL_HOURS`: 선택값, 기본 `24`

`CONTENT_IMAGE_CLEANUP_SECRET`은 Next.js 애플리케이션 컨테이너 환경변수로 설정한다. 스케줄 실행 명령이나 로그에 비밀값을 직접 출력하지 않는다.

## 기존 이미지 일회성 백필

DB 마이그레이션과 새 애플리케이션 배포가 끝난 뒤 먼저 삭제나 DB 변경 없는 점검을 실행한다.

```sh
CONTENT_IMAGE_BACKFILL_DRY_RUN=true node /app/scripts/backfill-existing-content-images.mjs
```

`discovered`가 기존 게시물 본문 및 대표 이미지에서 확인한 MinIO 이미지 수다. 결과를 확인한 뒤 실제 백필을 한 번 실행한다.

```sh
node /app/scripts/backfill-existing-content-images.mjs
```

게시물을 100개씩 읽으며 모든 페이지가 끝날 때까지 반복한다. 여러 번 실행해도 이미 연결된 자산은 `unchanged`로 집계되며 중복 생성하지 않는다. `PostImage` 메타데이터가 없는 본문 이미지는 MinIO 객체 메타데이터를 사용하고, 조회가 실패해도 URL과 객체 키는 기본 메타데이터로 안전하게 추적한다.

DB 게시물 어디에서도 참조되지 않는 과거 MinIO 객체는 소유 관계를 증명할 수 없으므로 백필이나 자동 삭제 대상에 포함하지 않는다.

## 배포 후 최초 정리 점검

애플리케이션 컨테이너 내부에서 삭제 없는 점검을 실행한다.

```sh
CONTENT_IMAGE_CLEANUP_DRY_RUN=true node /app/scripts/cleanup-pending-content-images.mjs
```

응답의 `deleted`는 실제 삭제 없이 삭제 대상 개수만 표시하고, `recovered`는 게시물 참조가 확인되어 연결 복구할 대상 개수를 표시한다.

## Synology 작업 스케줄러

제어판 → 작업 스케줄러 → 생성 → 예약된 작업 → 사용자 정의 스크립트에서 매일 03:20에 아래 명령을 실행한다. `<app-container>`는 운영 Next.js 컨테이너 이름으로 교체한다.

```sh
docker exec <app-container> node /app/scripts/cleanup-pending-content-images.mjs
```

컨테이너에는 `CONTENT_IMAGE_CLEANUP_SECRET`이 런타임 환경변수로 이미 주입되어 있어야 한다. 작업 성공 로그는 다음과 같은 JSON이다.

```json
{"ok":true,"scanned":3,"deleted":2,"recovered":1,"failed":0,"dryRun":false,"olderThanHours":24}
```

## 수동 API 호출

운영 장애 점검 시에만 내부 비밀값을 사용해 호출한다.

```sh
curl --fail-with-body --request POST \
  --header "Authorization: Bearer $CONTENT_IMAGE_CLEANUP_SECRET" \
  "https://gu3.kr/api/internal/maintenance/content-images?dryRun=true"
```

기존 이미지 백필 API는 `action=backfill`을 사용하며 `nextCursor`가 없을 때까지 호출해야 한다. 운영에서는 페이지 반복을 처리하는 컨테이너 내 스크립트를 우선 사용한다.

```sh
curl --fail-with-body --request POST \
  --header "Authorization: Bearer $CONTENT_IMAGE_CLEANUP_SECRET" \
  "https://gu3.kr/api/internal/maintenance/content-images?action=backfill&dryRun=true&take=100"
```

정리 API는 한 번에 최대 500개를 처리하며 같은 객체에 다시 실행해도 안전하도록 실제 게시물 참조와 DB 연결 상태를 삭제 직전에 재확인한다.
