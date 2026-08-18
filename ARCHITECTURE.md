# Meed Portfolio Architecture

This document describes **current reality** — the verified state of the repository, not historical intent.
It is the canonical architecture reference. Read `AGENTS.md` and `docs/README.md` first; ADRs live in `docs/adr/`.

## 1. System Summary

Meed Portfolio is a production portfolio site plus a CMS-backed admin. The public portfolio is server-rendered from
CMS/database content. Administrators sign in with database credentials and manage projects, case-study blocks, copy,
skills, services, testimonials, resume, and contact messages. All admin content mutations happen through authenticated
API routes; the public site never depends on hard-coded production content.

## 2. Technology Stack

Verified from `package.json`, `package-lock.json`, and config files:

- **Framework:** Next.js 16.3.1 (App Router), React 19.2.4
- **Language:** TypeScript 5 (strict mode), path alias `@/*`
- **Styling:** Tailwind CSS v4, semantic design tokens in `tokens/design-tokens.css`
- **ORM:** Prisma 7.9.1 with `@prisma/adapter-pg` (PrismaPg); datasource provider `postgresql`
- **Database:** Supabase-hosted PostgreSQL (runtime `DATABASE_URL`)
- **Auth:** Auth.js / NextAuth v5.0.0-beta.32 (Credentials provider, JWT session)
- **Password hashing:** bcryptjs (cost 12)
- **Validation:** Zod v4 with `react-hook-form` + custom resolver
- **Media:** Cloudinary (server-side signed uploads)
- **Motion:** Framer Motion (GSAP/Lenis are not installed)
- **Email:** Nodemailer (contact notifications)
- **Deployment:** GitHub (`master` production branch) → Vercel

## 3. Public Portfolio Architecture

```
CMS content (Prisma models)                        lib/portfolio-content.ts
  SiteContent, Project, ProjectImage,                 cached, published-only reads,
  CaseStudySection, Skill, ...                        dev fixtures (development only)
        |                                                     |
        v                                                     v
  typed domain data (PublicProject, section payloads)  ->  reusable presentation components
        |                                                     (components/projects, components/home, ...)
        v
  public portfolio UI (app routes: /, /work, /work/[slug], /about, /resume, /contact)
```

- Public reads go through `lib/portfolio-content.ts` (`getPublishedProjects`, `getPublishedProject`,
  `getSiteContent`, `getSkills`, ...). These always filter `published: true`.
- Development fixtures in `lib/dev-portfolio-fixtures.ts` render only when `NODE_ENV === "development"`; they never
  ship in production.
- `lib/prisma.ts` returns a mock client that rejects when `DATABASE_URL` is missing, so builds/tests can run
  without a database. No credentials live in code.

## 4. CMS Architecture

Database models (`prisma/schema.prisma`):

| Model | Purpose |
|---|---|
| `User` | Admin identity: `email`, bcrypt `password`, `role` (default `"admin"`) |
| `SiteContent` | Keyed JSON records (`key` unique, `value` JSON) for editable copy/settings |
| `Project` | Portfolio project + case study record (`slug` unique, `published`, `featured`, metadata, order) |
| `ProjectImage` | Ordered image gallery per project |
| `CaseStudySection` | Ordered typed content blocks per project (`type`, `payload` JSON, `metadata`, `imageUrl`, `order`) |
| `Skill` / `Service` | Capability and service records with order |
| `Testimonial` | Client testimonials |
| `SocialLink` | Social links with order |
| `ResumeExperience` | Résumé timeline entries |
| `Resume` | Active résumé file record (`fileUrl`) |
| `ContactMessage` | Contact form submissions |

Admin UI lives under `app/admin/` (login, dashboard, projects + case-study blocks, content, skills, services,
testimonials, resume, settings). Mutations are authenticated server-side in every `app/api/**/route.ts` handler.

## 5. Case Study Architecture

Case studies are **typed blocks**, not free-form HTML or per-project React pages.

- `lib/case-study.ts` defines 19 section types (`project_tldr`, `problem_statement`, `decision`, `evidence`,
  `before_after`, `annotated_screen`, `tradeoff`, `user_flow`, `interaction_states`, `architecture_diagram`,
  `design_system`, `ai_collaboration`, `timeline`, `outcome`, `reflection`, `next_steps`, `rich_text`, `gallery`,
  `product_principle`) with a Zod payload schema per type.
- `normalizeSection()` validates payloads and falls back safely to `rich_text` for unknown/legacy blocks.
- A single renderer (`components/projects/CaseStudyLayout` + `CaseStudySection`) renders all types.
- `app/work/[slug]/page.tsx` is the only project page. **A new project requires CMS data only — never a new React page.**

## 6. Authentication

- Auth.js Credentials provider in `lib/auth.ts`.
- `authorize` queries `prisma.user` by normalized email and compares with `bcrypt.compare` against the stored hash
  (a dummy hash keeps timing uniform for unknown users).
- **Database-only**: there is no environment-password runtime fallback. `ADMIN_EMAIL`/`ADMIN_PASSWORD` are used only
  by explicit seed/password-rotation tooling.
- Login rate limiting: per IP + hashed-email, in-memory, 5 failures → 15-minute cooldown (`lib/rate-limit.ts`).
- JWT session strategy; `role` and `id` flow into the session.
- Authentication failures fail closed (catch → `recordLoginFailure` → reject).

## 7. Authorization

- Admin pages: server-side `auth()` checks in layouts/pages; the dashboard and protected pages `redirect("/admin/login")`
  when unauthenticated.
- Admin APIs: every mutation handler calls `auth()` and returns `401` when unauthenticated.
- Public reads: projects are filtered to `published: true` for non-admins (see `app/api/projects/route.ts`).
- Media/content mutations are admin-only (`app/api/upload/route.ts`, project images/sections routes).
- No middleware layer is currently used; protection is per-route/server-side. See `docs/security/security-regression-contract.md`.

## 8. Database

- PostgreSQL via Supabase. Prisma 7 with `PrismaPg` adapter; `DATABASE_URL` is read from environment at runtime.
- Migrations are checked into `prisma/migrations/` (`init`, `add_resume_experience`, `evolve_case_study_sections`).
- Migration rules: additive/reviewed migrations only; no destructive migration without approval; never use production
  as a destructive test database.

## 9. Media

- Cloudinary owns production uploads (`app/api/upload/route.ts`).
- Server-side signed uploads: server computes the SHA-1 signature and uploads directly to Cloudinary; the API secret
  never leaves the server.
- Restrictions: authenticated access, allowed types (JPG/JPEG/PNG/WebP/AVIF, PDF), MIME + extension agreement,
  magic-byte signature checks, size caps (12 MB images, 5 MB PDFs), random UUID public IDs.
- CMS media is replaceable via the admin; uploads return `{ url }` consumed by existing clients.

## 10. Contact

`app/api/contact/route.ts` protections:

- Zod validation with bounds (name ≤ 100, email ≤ 254, message 10–5000, subject ≤ 160).
- Request size cap (20 KB) before parsing.
- Hidden honeypot field (`website`): filled honeypots silently succeed without storing.
- IP rate limit: 5 submissions / 15 minutes per running instance.
- Duplicate suppression: 1 / minute per IP+email+message fingerprint.
- Notifications are emailed via Nodemailer; stored messages are readable in the admin.

## 11. Design System Architecture

- Visual contract: `docs/portfolio-brand-system.md` — editorial, evidence-led, restrained; the work is the subject.
- Design tokens: single semantic source `tokens/design-tokens.css` (color, type roles, spacing, radii, motion).
- Project-local skills (authoritative for taste/motion decisions):
  - `skills/product-portfolio-taste/SKILL.md`
  - `skills/product-portfolio-motion/SKILL.md`
- Figma is the visual source of truth only where explicitly approved; approved direction is recorded in ADRs and
  phase reports under `docs/`.

## 12. Deployment

- Source: GitHub (`themeed9/Meed-Portfolio`). Production branch: `master`. Feature work happens on branches
  (e.g. `agent/portfolio-redesign`) and merges into `master`.
- Platform: Vercel (automatic deployments from `master`).
- Production environment variables are configured in Vercel: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`,
  Cloudinary vars, and (maintenance only) `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **No secrets in the repository.** `.env*` are gitignored except `.env.example`. A separate, owner-approved Git
  history cleanup for historical `.env.local` remains pending and is controlled separately.

## 13. Critical Invariants

1. Production portfolio content comes from the CMS/database — never hard-coded.
2. New projects must not require a new React page.
3. Admin runtime authentication is database-only (no environment-password fallback).
4. Unpublished projects must never be returned publicly.
5. Uploads must remain Cloudinary server-side signed; no local filesystem upload path.
6. Contact abuse controls (validation, honeypot, rate limit, duplicate suppression) must stay active.
7. Authentication/authorization failures fail closed.
8. Secrets must not be committed.
9. No destructive migration or destructive production operation without approval.
10. Motion must stay purposeful and restrained (see `skills/product-portfolio-motion/SKILL.md`).

See `docs/security/security-regression-contract.md` for the executable security invariants.

## 14. ADR Index

| ADR | Decision |
|---|---|
| `docs/adr/ADR-001.md` | CMS is the portfolio content authority |
| `docs/adr/ADR-002.md` | Database-only administrator authentication |
| `docs/adr/ADR-003.md` | Typed case-study block architecture |
| `docs/adr/ADR-004.md` | Cloudinary owns production uploads |
| `docs/adr/ADR-005.md` | Editorial, evidence-led portfolio presentation |
| `docs/adr/ADR-006.md` | CMS editability is non-negotiable |
| `docs/adr/ADR-007.md` | Services is not a primary product surface |
| `docs/adr/ADR-008.md` | Database / deployment architecture (Supabase + Vercel) |
| `docs/adr/ADR-009.md` | Motion is purposeful and restrained |
