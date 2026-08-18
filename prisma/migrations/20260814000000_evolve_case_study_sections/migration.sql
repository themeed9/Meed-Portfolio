-- Non-destructive evolution: existing rows remain valid rich-text blocks.
ALTER TABLE "CaseStudySection"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'rich_text',
ADD COLUMN "eyebrow" TEXT,
ADD COLUMN "payload" JSONB,
ADD COLUMN "metadata" JSONB,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Public portfolio metadata and distinct editorial image roles.
ALTER TABLE "Project"
ADD COLUMN "recruiterSummary" TEXT,
ADD COLUMN "status" TEXT,
ADD COLUMN "platform" TEXT,
ADD COLUMN "homepageImage" TEXT,
ADD COLUMN "heroImage" TEXT;
