CREATE TYPE "PastoralCouncilChildrenLayout" AS ENUM ('AUTO', 'ROW', 'COLUMN', 'GRID');

ALTER TABLE "PastoralCouncilPosition"
    ADD COLUMN "childrenLayout" "PastoralCouncilChildrenLayout" NOT NULL DEFAULT 'AUTO',
    ADD COLUMN "childrenColumns" INTEGER NOT NULL DEFAULT 2;

ALTER TABLE "PastoralCouncilPosition"
    ADD CONSTRAINT "PastoralCouncilPosition_childrenColumns_check"
    CHECK ("childrenColumns" BETWEEN 1 AND 4);
