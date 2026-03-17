CREATE TYPE "PastoralCouncilPlaceholderImageType" AS ENUM (
  'WOMAN',
  'MAN',
  'NUN',
  'PRIEST'
);

ALTER TABLE "PastoralCouncilMember"
  ADD COLUMN "placeholderImageType" "PastoralCouncilPlaceholderImageType" NOT NULL DEFAULT 'PRIEST';
