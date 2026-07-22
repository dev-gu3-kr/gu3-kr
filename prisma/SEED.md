# Seed 실행 정책

## 일반 seed

```sh
pnpm run db:seed
```

일반 seed는 마스터 관리자만 생성하거나 갱신합니다. 사목협의회 데이터는 실행하지 않습니다.

## 사목협의회 초기 데이터

사목협의회 초기 데이터가 전혀 없는 환경에서만 아래 명령을 수동으로 실행합니다.

```sh
PASTORAL_COUNCIL_SEED_CONFIRM=INSERT_ONLY pnpm run db:seed:pastoral-council
```

전용 seed는 `role`을 기준으로 새 행만 생성합니다. 이미 존재하는 역할은 건너뛰므로 운영 화면에서 수정한 이름, 연락처, 이미지, 활성 상태를 변경하지 않습니다.

`pnpm run seed:boundary:check`는 일반 seed와 전용 seed의 분리 및 insert-only 정책을 검사합니다. 이 검사는 `pnpm run validate`에도 포함됩니다.
