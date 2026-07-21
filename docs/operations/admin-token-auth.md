# 관리자 토큰 인증 운영

## 필수 환경변수

관리자 access JWT 서명에는 32자 이상의 별도 비밀값을 사용한다.

```sh
openssl rand -base64 48
```

생성한 값을 애플리케이션 런타임의 `AUTH_TOKEN_SECRET`에 설정한다. 여러 인스턴스를 운영할 때는 모두 같은 값을 사용한다. Prisma seed를 실행할 때는 8자 이상의 `ADMIN_SEED_PASSWORD`도 별도로 설정한다.

## Synology NAS Docker seed

운영 애플리케이션 이미지는 Next.js standalone 런타임이므로 Prisma CLI와 seed 소스를 포함하지 않는다. NAS에서는 동일 배포에서 발행된 migrator 이미지를 일회성 컨테이너로 실행한다.

먼저 PostgreSQL 컨테이너가 연결된 Docker 네트워크를 확인한다.

```bash
sudo docker inspect postgres \
  --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{"\n"}}{{end}}'
```

`DATABASE_URL`, `DATABASE_SCHEMA`, `ADMIN_SEED_PASSWORD`를 포함한 전용 환경 파일을 준비한 뒤 권한을 제한한다.

```bash
sudo chmod 600 /volume1/docker/cathedral-nextjs/seed.env
```

최신 migrator 이미지를 받고 seed를 실행한다. `<POSTGRES_NETWORK>`에는 위에서 확인한 네트워크 이름을 넣는다.

```bash
sudo docker pull ghcr.io/dev-gu3-kr/gu3-kr-migrator:latest

sudo docker run --rm \
  --network <POSTGRES_NETWORK> \
  --env-file /volume1/docker/cathedral-nextjs/seed.env \
  ghcr.io/dev-gu3-kr/gu3-kr-migrator:latest \
  pnpm exec prisma db seed
```

seed는 `username=master`인 기존 계정을 유지하면서 이메일과 비밀번호를 환경 변수 기준으로 갱신하고, 사목협의회 초기 데이터를 upsert한다. 실행 전 `DATABASE_URL`이 대상 DB를 가리키는지 확인한다.

## 세션 구조

- access JWT: 15분, `HttpOnly` 쿠키 또는 `Authorization: Bearer`로 전달
- refresh token: 30일, `HttpOnly` 쿠키로만 전달하고 DB에는 SHA-256 해시만 저장
- refresh rotation: 발급 15일 이후 갱신 시 새 토큰으로 교체하고 재사용을 탐지
- CSRF: 쿠키 기반 변경 요청은 double-submit 쿠키와 `x-csrf-token` 헤더를 함께 검증
- password: 신규·초기화 계정은 scrypt로 저장하고 기존 SHA-256 계정은 첫 로그인 성공 시 자동 승격

## 배포 순서

1. NAS 컨테이너 환경에 `AUTH_TOKEN_SECRET`을 설정한다.
2. `prisma migrate deploy`로 `AdminRefreshToken` 테이블을 생성한다.
3. 새 애플리케이션 이미지를 배포한다.
4. `/admin/login`에서 이메일과 비밀번호로 로그인한다.

기존의 사용자 ID 쿠키는 더 이상 인증으로 인정하지 않으므로 배포 후 관리자는 다시 로그인해야 한다.

Synology 리버스 프록시는 외부 요청 정보를 애플리케이션에 전달하도록 `X-Forwarded-Proto`와 `X-Forwarded-Host` 헤더를 유지해야 한다. 로그인 CSRF 검사는 이 값과 `NEXT_PUBLIC_SITE_URL`을 사용해 브라우저의 `Origin`이 동일 출처인지 확인한다.

## 비밀값 교체

`AUTH_TOKEN_SECRET`을 교체하면 기존 access JWT는 즉시 무효화된다. 침해 대응 목적이라면 `AdminRefreshToken`의 활성 세션도 함께 폐기해야 기존 refresh token으로 새 access JWT를 발급할 수 없다.
