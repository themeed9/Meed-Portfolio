-- Additive only (ADR-010): existing rows stay valid through defaults and nullable columns.
-- Homepage card fields. Text colour is computed from primaryColor, never stored.
ALTER TABLE "Project" ADD COLUMN     "cardPayload" JSONB,
ADD COLUMN     "cardTemplate" TEXT NOT NULL DEFAULT 'media_split',
ADD COLUMN     "collection" TEXT NOT NULL DEFAULT 'product',
ADD COLUMN     "primaryColor" TEXT;

-- Image dimensions and role, so cards can lay out media without cropping.
ALTER TABLE "ProjectImage" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "width" INTEGER;
