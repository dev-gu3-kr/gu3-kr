# 관리자 토큰 인증 운영

## 필수 환경변수

관리자 access JWT 서명에는 32자 이상의 별도 비밀값을 사용한다.

```sh
openssl rand -base64 48
```

생성한 값을 애플리케이션 런타임의 `AUTH_TOKEN_SECRET`에 설정한다. 여러 인스턴스를 운영할 때는 모두 같은 값을 사용한다. Prisma seed를 실행할 때는 12자 이상의 `ADMIN_SEED_PASSWORD`도 별도로 설정한다.

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

## 비밀값 교체

`AUTH_TOKEN_SECRET`을 교체하면 기존 access JWT는 즉시 무효화된다. 침해 대응 목적이라면 `AdminRefreshToken`의 활성 세션도 함께 폐기해야 기존 refresh token으로 새 access JWT를 발급할 수 없다.
