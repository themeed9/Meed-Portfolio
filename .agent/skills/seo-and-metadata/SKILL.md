---
name: seo-and-metadata
description: Metadata API, Open Graph/Twitter cards, sitemap, robots, structured data for this portfolio
---

# SEO & Metadata

## Metadata API
- Server components: use `export const metadata` or `generateMetadata`
- Client components: create a sibling `layout.tsx` with `export const metadata`
- Root layout uses `title.template` — child pages set their own segment
- `metadataBase` set in root layout for proper OG image resolution

## Open Graph & Twitter Cards
- Root layout sets defaults; per-page overrides via `generateMetadata` or `lib/seo.ts` helper
- Dynamic OG image at `app/opengraph-image.tsx` (Next.js ImageResponse)
- All images: 1200×630px

## Sitemap & Robots
- `app/sitemap.ts` — all public routes with priorities and change frequencies
- `app/robots.ts` — allows all crawlers, disallows `/admin/` and `/api/`

## Structured Data
- JSON-LD `Person` schema in root layout (name, jobTitle, description, url, sameAs)
- Add `CreativeWork`/`Project` schema on project detail pages where relevant

## Content Basics
- One `<h1>` per page
- Descriptive link text and image alt text
- Canonical URLs via `lib/seo.ts` helper
