CREATE TABLE "PastoralCouncilPosition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "defaultPlaceholderImageType" "PastoralCouncilPlaceholderImageType" NOT NULL DEFAULT 'MAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PastoralCouncilPosition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PastoralCouncilPosition_parentId_isActive_sortOrder_idx"
    ON "PastoralCouncilPosition"("parentId", "isActive", "sortOrder");

ALTER TABLE "PastoralCouncilPosition"
    ADD CONSTRAINT "PastoralCouncilPosition_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "PastoralCouncilPosition"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PastoralCouncilMember" ADD COLUMN "positionId" TEXT;

INSERT INTO "PastoralCouncilPosition" (
    "id",
    "title",
    "parentId",
    "sortOrder",
    "defaultPlaceholderImageType"
)
VALUES
    ('pc-pos-parish-priest', '주임신부', NULL, 10, 'PRIEST'),
    ('pc-pos-assistant-priest', '보좌신부', 'pc-pos-parish-priest', 20, 'PRIEST'),
    ('pc-pos-religious', '수도자', 'pc-pos-parish-priest', 30, 'NUN'),
    ('pc-pos-chairperson', '총 회장', 'pc-pos-parish-priest', 40, 'MAN'),
    ('pc-pos-vice-chairman-male', '남성 부회장', 'pc-pos-chairperson', 50, 'MAN'),
    ('pc-pos-secretary', '총무', 'pc-pos-chairperson', 60, 'MAN'),
    ('pc-pos-liturgy-department', '전례 분과', 'pc-pos-vice-chairman-male', 100, 'WOMAN'),
    ('pc-pos-education-youth-department', '교육/청년 분과', 'pc-pos-vice-chairman-male', 110, 'MAN'),
    ('pc-pos-social-pastoral-department', '사회사목 분과', 'pc-pos-vice-chairman-male', 120, 'MAN'),
    ('pc-pos-finance-department', '재정 분과', 'pc-pos-vice-chairman-male', 130, 'WOMAN'),
    ('pc-pos-mission-department', '선교 분과', 'pc-pos-vice-chairman-male', 140, 'MAN'),
    ('pc-pos-facility-management-department', '시설관리 분과', 'pc-pos-vice-chairman-male', 150, 'MAN'),
    ('pc-pos-senior-department', '노인 분과', 'pc-pos-vice-chairman-male', 160, 'WOMAN'),
    ('pc-pos-family-life-environment-department', '가정/생명/환경 분과', 'pc-pos-vice-chairman-male', 170, 'WOMAN'),
    ('pc-pos-middle-high-department', '중고등 분과', 'pc-pos-vice-chairman-male', 180, 'MAN'),
    ('pc-pos-elementary-pr-department', '유초등/홍보 분과', 'pc-pos-vice-chairman-male', 190, 'MAN'),
    ('pc-pos-district-chief-male', '남성 총구역장', 'pc-pos-secretary', 200, 'MAN'),
    ('pc-pos-male-district-1', '남성 1지역장', 'pc-pos-district-chief-male', 210, 'MAN'),
    ('pc-pos-female-district-1', '여성 1지역장', 'pc-pos-district-chief-male', 220, 'WOMAN'),
    ('pc-pos-male-district-2', '남성 2지역장', 'pc-pos-district-chief-male', 230, 'MAN'),
    ('pc-pos-female-district-2', '여성 2지역장', 'pc-pos-district-chief-male', 240, 'WOMAN'),
    ('pc-pos-male-district-3', '남성 3지역장', 'pc-pos-district-chief-male', 250, 'MAN'),
    ('pc-pos-female-district-3', '여성 3지역장', 'pc-pos-district-chief-male', 260, 'WOMAN'),
    ('pc-pos-male-district-4', '남성 4지역장', 'pc-pos-district-chief-male', 270, 'MAN'),
    ('pc-pos-female-district-4', '여성 4지역장', 'pc-pos-district-chief-male', 280, 'WOMAN'),
    ('pc-pos-male-district-5', '남성 5지역장', 'pc-pos-district-chief-male', 290, 'MAN'),
    ('pc-pos-female-district-5', '여성 5지역장', 'pc-pos-district-chief-male', 300, 'WOMAN');

UPDATE "PastoralCouncilMember"
SET "positionId" = CASE "role"::text
    WHEN 'PARISH_PRIEST' THEN 'pc-pos-parish-priest'
    WHEN 'ASSISTANT_PRIEST' THEN 'pc-pos-assistant-priest'
    WHEN 'RELIGIOUS' THEN 'pc-pos-religious'
    WHEN 'CHAIRPERSON' THEN 'pc-pos-chairperson'
    WHEN 'VICE_CHAIRMAN_MALE' THEN 'pc-pos-vice-chairman-male'
    WHEN 'SECRETARY' THEN 'pc-pos-secretary'
    WHEN 'DISTRICT_CHIEF_MALE' THEN 'pc-pos-district-chief-male'
    WHEN 'LITURGY_DEPARTMENT' THEN 'pc-pos-liturgy-department'
    WHEN 'EDUCATION_YOUTH_DEPARTMENT' THEN 'pc-pos-education-youth-department'
    WHEN 'SOCIAL_PASTORAL_DEPARTMENT' THEN 'pc-pos-social-pastoral-department'
    WHEN 'FINANCE_DEPARTMENT' THEN 'pc-pos-finance-department'
    WHEN 'MISSION_DEPARTMENT' THEN 'pc-pos-mission-department'
    WHEN 'FACILITY_MANAGEMENT_DEPARTMENT' THEN 'pc-pos-facility-management-department'
    WHEN 'SENIOR_DEPARTMENT' THEN 'pc-pos-senior-department'
    WHEN 'FAMILY_LIFE_ENVIRONMENT_DEPARTMENT' THEN 'pc-pos-family-life-environment-department'
    WHEN 'MIDDLE_HIGH_DEPARTMENT' THEN 'pc-pos-middle-high-department'
    WHEN 'ELEMENTARY_PR_DEPARTMENT' THEN 'pc-pos-elementary-pr-department'
    WHEN 'MALE_DISTRICT_1' THEN 'pc-pos-male-district-1'
    WHEN 'FEMALE_DISTRICT_1' THEN 'pc-pos-female-district-1'
    WHEN 'MALE_DISTRICT_2' THEN 'pc-pos-male-district-2'
    WHEN 'FEMALE_DISTRICT_2' THEN 'pc-pos-female-district-2'
    WHEN 'MALE_DISTRICT_3' THEN 'pc-pos-male-district-3'
    WHEN 'FEMALE_DISTRICT_3' THEN 'pc-pos-female-district-3'
    WHEN 'MALE_DISTRICT_4' THEN 'pc-pos-male-district-4'
    WHEN 'FEMALE_DISTRICT_4' THEN 'pc-pos-female-district-4'
    WHEN 'MALE_DISTRICT_5' THEN 'pc-pos-male-district-5'
    WHEN 'FEMALE_DISTRICT_5' THEN 'pc-pos-female-district-5'
END;

ALTER TABLE "PastoralCouncilMember" ALTER COLUMN "positionId" SET NOT NULL;

DROP INDEX "PastoralCouncilMember_role_key";
DROP INDEX "PastoralCouncilMember_isActive_sortOrder_idx";

ALTER TABLE "PastoralCouncilMember" DROP COLUMN "role";

CREATE INDEX "PastoralCouncilMember_positionId_isActive_sortOrder_idx"
    ON "PastoralCouncilMember"("positionId", "isActive", "sortOrder");

ALTER TABLE "PastoralCouncilMember"
    ADD CONSTRAINT "PastoralCouncilMember_positionId_fkey"
    FOREIGN KEY ("positionId") REFERENCES "PastoralCouncilPosition"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TYPE "PastoralCouncilRole";
