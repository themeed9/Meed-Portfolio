---
name: performance-optimization
description: Next.js performance — image optimization, font loading, code splitting, lazy loading, Core Web Vitals
---

# Performance Optimization

Target LCP < 2.5s, CLS < 0.1, INP < 200ms.

## Images
- Always use `next/image` with explicit `width`/`height` or `fill` with sized parent
- Above-fold images (hero) get `priority`; everything else lazy-loads by default
- Set `sizes` attribute for responsive images

## Fonts
- Load via `next/font/google` or `next/font/local` — never `<link>` to Google Fonts CDN
- `display: swap` or `optional` for non-critical decorative fonts
- Max 2 font families, only include weights actually used

## Code Splitting
- `next/dynamic` for below-fold/heavy components with `ssr: false` where appropriate
- Import individual icons from lucide-react (tree-shakes correctly)
- Keep `'use client'` boundaries minimal; prefer Server Components for static content

## Animation Performance
- Only animate `transform`/`opacity`/`filter` (compositor-friendly)
- Avoid animating large background images directly

## Third-Party Scripts
- Use `next/script` with `strategy="lazyOnload"` or `"afterInteractive"`
- Audit dependencies regularly

## Rendering
- `force-dynamic` on pages with live CMS data
- Static pages use `export const dynamic = "force-static"` where possible
