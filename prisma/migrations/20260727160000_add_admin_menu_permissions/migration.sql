CREATE TYPE "AdminMenuPermission" AS ENUM (
  'NOTICES',
  'PRIESTS',
  'NUNS',
  'BULLETINS',
  'EVENTS',
  'GALLERY',
  'COMMUNITY_ABOUT',
  'PASTORAL_COUNCIL',
  'YOUTH_ABOUT',
  'YOUTH_BLOG',
  'INQUIRIES'
);

ALTER TABLE "User"
ADD COLUMN "menuPermissions" "AdminMenuPermission"[] NOT NULL DEFAULT ARRAY[]::"AdminMenuPermission"[];

-- 기존 일반 관리자는 배포 전 접근 가능했던 메뉴를 그대로 유지한다.
UPDATE "User"
SET "menuPermissions" = ARRAY[
  'NOTICES'::"AdminMenuPermission",
  'PRIESTS'::"AdminMenuPermission",
  'NUNS'::"AdminMenuPermission",
  'BULLETINS'::"AdminMenuPermission",
  'EVENTS'::"AdminMenuPermission",
  'GALLERY'::"AdminMenuPermission",
  'COMMUNITY_ABOUT'::"AdminMenuPermission",
  'PASTORAL_COUNCIL'::"AdminMenuPermission",
  'YOUTH_ABOUT'::"AdminMenuPermission",
  'YOUTH_BLOG'::"AdminMenuPermission"
]
WHERE "role" <> 'SUPER_ADMIN';
