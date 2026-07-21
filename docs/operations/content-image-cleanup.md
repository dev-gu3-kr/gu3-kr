# 본문 이미지 자동 정리 운영

모든 업로드 파일은 `FileAsset`에 한 번만 기록된다. 게시물을 저장하면 `PostAsset`이 본문(`CONTENT`), 대표 이미지(`COVER`), 첨부파일(`ATTACHMENT`) 역할을 연결한다. `PostAsset` 사용처가 없는 파일은 PENDING으로 간주하며 기본 유예 시간 24시간이 지나면 MinIO와 DB에서 함께 삭제한다.

## 무중단 전환 순서

1. `20260721213000_normalize_file_assets`로 신규 테이블을 만들고 기존 데이터를 백필한다.
2. 신규 애플리케이션 배포 직전에 `prisma migrate deploy`를 실행해 `20260721220000_sync_file_asset_cutover`를 적용한다. 이 마이그레이션은 구버전 애플리케이션이 전환 전까지 기록한 데이터를 한 번 더 동기화한다.
3. 신규 애플리케이션 배포와 조회·등록·수정·삭제 검증을 완료한다.
4. 안정화 기간 후 별도 마이그레이션으로 `Attachment`, `PostImage`, `ContentImageAsset`, `ContentImageStatus`를 제거한다.

첫 배포에서 기존 테이블을 바로 삭제하지 않는다. 롤백 가능성을 유지하고, 신규 코드가 `FileAsset`과 `PostAsset`만 사용하는 것을 운영 환경에서 확인한 뒤 제거한다.

## 필수 런타임 환경변수

- `CONTENT_IMAGE_CLEANUP_SECRET`: 32바이트 이상의 임의 비밀값
- `CONTENT_IMAGE_PENDING_TTL_HOURS`: 선택값, 기본 `24`

`CONTENT_IMAGE_CLEANUP_SECRET`은 Next.js 애플리케이션 컨테이너 환경변수로 설정한다. 스케줄 실행 명령이나 로그에 비밀값을 직접 출력하지 않는다.

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

정리 API는 한 번에 최대 500개를 처리하며 같은 객체에 다시 실행해도 안전하도록 실제 게시물 참조와 DB 연결 상태를 삭제 직전에 재확인한다.
