# Meed Portfolio Codebase Architecture and Cleanup Audit

## Executive summary

Meed Portfolio is a Next.js 16 App Router application with a server-rendered public portfolio, a credentials-protected CMS, Prisma/PostgreSQL persistence, local-file uploads, and three overlapping motion approaches. Its core is viable, but successive design iterations left dead homepage sections, duplicate token generations, an unnecessarily broad client boundary, and CMS models that no longer fully match the product-design portfolio direction.

This pass removed only high-confidence dead code and preventive maintenance issues. It did not redesign the interface, delete routes or production content, alter the Prisma schema, migrate data, weaken authentication, or delete media.

## Current architecture map

```text
Browser
├── public pages
│   ├── static/fallback content: lib/defaults.ts
│   ├── project presentation: components/projects
│   └── selected direct Prisma reads: resume, sitemap
├── admin pages
│   ├── server-rendered lists and dashboards via Prisma
│   └── client forms calling internal /api routes
└── global client shell
    ├── ThemeProvider
    ├── Lenis + GSAP ScrollTrigger bridge
    ├── loading animation
    ├── route transition
    └── client-fetched navigation settings

Route handlers
├── NextAuth credentials endpoint
├── public reads and contact submission
├── authenticated CMS CRUD
└── authenticated local filesystem upload

Persistence
├── PostgreSQL via Prisma 7 and PrismaPg
├── SiteContent JSON records for settings/hero content
├── normalized portfolio/admin models
└── public/uploads for uploaded files
```

### Repository areas

| Area | Responsibility | Assessment |
| --- | --- | --- |
| `app/` | Pages, layouts, metadata and 21 API handlers | Functional but CRUD boundaries are inconsistent |
| `components/ui` | Button, input, textarea, badge and modal | Small and useful; styling generations vary |
| `components/layout` | Public/admin shells | Public shell hydrates too broadly |
| `components/home` | Current hero, projects and AI workflow | Two static sections and one animation-heavy client section remain |
| `components/projects` | Listing card and case-study renderer | Strategically important, but current renderer is a large hydrated monolith |
| `components/admin` | Project/content management | Necessary, with duplicated request/error patterns |
| `lib/` | Auth, Prisma, defaults, email, SEO, validation, motion and theme | Reasonable responsibilities; several need tighter server/client separation |
| `prisma/` | Schema, migrations and seed | Production-sensitive; no schema changes made |
| `tokens/` | CSS tokens and JSON sources | Multiple generations remain partially duplicated |
| `public/uploads` | CMS/project evidence and resume | 104.1 MB tracked; many exact duplicates, deliberately retained |
| `.agent`, `skills`, docs | Old and current agent guidance | Conflicting generations need an approved documentation cleanup |

## Baseline: before cleanup

- 161 repository files excluding `node_modules` and `.next`.
- 41 App Router page/route/layout source entries.
- 16 page routes: 7 public and 9 admin.
- 21 API routes.
- 38 shared TSX components.
- 41 files with explicit `use client` across `app` and `components`; 31 were shared components.
- 15 production and 15 development direct dependencies.
- 4,590 TSX lines, 1,045 TypeScript lines, and 459 CSS lines across the primary source folders.
- 35 tracked public assets totaling 104,100,656 bytes (approximately 99.3 MiB).
- Baseline optimized build passed.
- Baseline lint failed with 18 errors and 21 warnings.
- Baseline `.next/static` contained 32 JavaScript files totaling 1,464,889 bytes. This is an output-directory total, not per-route transferred JS.

Major problems were dead animated sections, duplicate token sources, global animation hydration, API/Server Action overlap, local uploads unsuitable for durable serverless storage, weak CMS validation consistency, a monolithic case-study client component, and a dangerous default admin credential fallback.

## Route audit

| Route | Kind | Classification | Rationale |
| --- | --- | --- | --- |
| `/` | Public | REDESIGN LATER | Core positioning route; preserve current content foundation |
| `/work` | Public | REDESIGN LATER | Essential project index |
| `/work/[slug]` | Public | REDESIGN LATER | Essential case-study route; renderer must evolve into blocks |
| `/about` | Public | REDESIGN LATER | Strategically useful authored context |
| `/services` | Public redirect | MERGE / DEPRECATE | Already redirects to `/about`; do not restore freelance-agency positioning |
| `/resume` | Public | REDESIGN LATER | Useful recruiter route; current presentation and data split need simplification |
| `/contact` | Public | REDESIGN LATER | Useful conversion route; preserve submission function |
| `/admin` | Admin | INTERNAL/ADMIN | Essential CMS overview |
| `/admin/login` | Admin | INTERNAL/ADMIN | Essential authentication entry |
| `/admin/projects*` | Admin | INTERNAL/ADMIN | Essential project CRUD; form lacks case-study block authoring |
| `/admin/content` | Admin | INTERNAL/ADMIN | Mixed site content and contact inbox; consolidate later |
| `/admin/resume` | Admin | INTERNAL/ADMIN | Preserve while resume remains dynamic |
| `/admin/settings` | Admin | INTERNAL/ADMIN | Necessary but oversized 490-line client page |
| `/admin/skills` | Admin | INTERNAL/ADMIN / EVOLVE | Skill percentages and Service CRUD no longer match direction |
| `/admin/testimonials` | Admin | INTERNAL/ADMIN / REVIEW | Preserve legitimate data; reduce strategic prominence |
| `/api/auth/[...nextauth]` | API | ESSENTIAL | Authentication boundary |
| `/api/contact` | API | ESSENTIAL | Public submission plus protected inbox read |
| `/api/projects`, `/api/projects/[id]` | API | ESSENTIAL / CONSOLIDATE | Used by admin CRUD; public GET is currently broader than needed |
| `/api/projects/[id]/delete` | API | DUPLICATE | Duplicates `DELETE /api/projects/[id]`; remove after caller verification |
| `/api/projects/[id]/toggle` | API | USEFUL | Focused publish mutation; candidate Server Action |
| `/api/content*` | API | USEFUL / CONSOLIDATE | Admin-only boundary; candidate Server Actions |
| `/api/settings`, `/api/hero-slides`, `/api/social-links` | API | USEFUL / CONSOLIDATE | Public reads plus admin writes; schemas and fetch strategy need alignment |
| `/api/resume*` | API | USEFUL / CONSOLIDATE | Admin mutations are Server Action candidates |
| `/api/skills*`, `/api/services*`, `/api/testimonials*` | API | DEPRECATE OR EVOLVE | Depend on unresolved product/data decisions |
| `/api/upload` | API | ESSENTIAL BUT FRAGILE | Authenticated, but writes to local deployment filesystem and lacks size/type policy |

### Services decision

Choose option B: capabilities belong as concise content within About/Home, not as a freelance services route. `/services` is already only a redirect, so retain it temporarily for inbound-link compatibility and later convert it to a permanent redirect in deployment configuration. Preserve the `Service` table until data is inspected and migrated or archived.

## Component inventory

### Retained components

| Path | Purpose / used by | Boundary | Status |
| --- | --- | --- | --- |
| `components/Providers.tsx` | Theme, smooth scroll and loading lifecycle; root layout | Client | NEEDS CONSOLIDATION |
| `components/admin/ContentForm.tsx` | SiteContent editing; admin content | Client | REUSABLE, weak typing |
| `components/admin/ProjectForm.tsx` | Shared create/edit fields and uploads | Client | ESSENTIAL, EVOLVE for blocks |
| `components/admin/ProjectTable.tsx` | Project list mutations | Client | ESSENTIAL |
| `components/effects/FadeIn.tsx` | Resume reveal | Client | LEGACY / SIMPLIFY |
| `components/effects/SmoothScroll.tsx` | Lenis/GSAP global scroll bridge | Client | QUESTIONABLE |
| `components/home/AiWorkflow.tsx` | Animated workflow section | Client | LEGACY / REDESIGN LATER |
| `components/home/FeaturedProjects.tsx` | Homepage project evidence | Server | ESSENTIAL |
| `components/home/Hero.tsx` | Homepage positioning and media | Server | ESSENTIAL |
| `components/layout/AdminHeader.tsx` | Shared admin heading/back link | Client | REUSABLE; likely can be Server |
| `components/layout/AdminSidebar.tsx` | Admin navigation/sign-out | Client | ESSENTIAL |
| `components/layout/AppShell.tsx` | Hides public nav on admin routes | Client | NEEDS CONSOLIDATION |
| `components/layout/Footer.tsx` | Global footer | Server | ESSENTIAL / SIMPLIFY |
| `components/layout/Navbar.tsx` | Public navigation/theme/menu/settings | Client | ESSENTIAL; split server data from interaction |
| `components/layout/PageTransition.tsx` | Global route animation | Client | QUESTIONABLE / REMOVE |
| `components/loading/LoadingScreen.tsx` | First-load GSAP animation | Client | QUESTIONABLE / REMOVE |
| `components/projects/CaseStudyLayout.tsx` | Entire project detail renderer | Client | ESSENTIAL / REDESIGN ARCHITECTURE |
| `components/projects/CaseStudySection.tsx` | Generic prose section animation | Client | EVOLVE into typed server-rendered blocks |
| `components/projects/ProjectCard.tsx` | Work listing card | Client | REUSABLE; can become Server |
| `components/ui/Badge.tsx` | Tags/category display | Server | REUSABLE |
| `components/ui/Button.tsx` | Button primitive | Client | REUSABLE; client boundary inherited by many forms |
| `components/ui/Input.tsx` | Accessible input primitive | Server-capable | REUSABLE |
| `components/ui/Modal.tsx` | Admin CRUD dialogs | Client | ESSENTIAL |
| `components/ui/Textarea.tsx` | Accessible textarea primitive | Server-capable | REUSABLE |

Dependencies within components are primarily Next primitives, React, Lucide, Framer Motion, GSAP, Lenis, React Icons, and internal form/UI modules. No duplicate navigation or modal implementation remains, but public and admin mutation patterns repeat.

### Removed components

The following had zero imports/consumers across the repository and represented abandoned visual or motion experiments:

- `components/effects/Marquee.tsx`
- `components/effects/SectionReveal.tsx`
- `components/effects/TextReveal.tsx`
- `components/home/CtaSection.tsx`
- `components/home/ImpactStats.tsx`
- `components/home/ProductSlideShow.tsx`
- `components/home/SkillsOverview.tsx`
- `components/home/TestimonialSection.tsx`
- `components/home/ValueProposition.tsx`
- `components/motion/FadeRise.tsx`
- `components/motion/ParallaxLayer.tsx`
- `components/motion/StaggerChildren.tsx`
- `components/layout/Container.tsx`
- `components/ui/Card.tsx`

## Design system, CSS and Tailwind audit

Two token eras coexist:

1. `tokens/design-tokens.css`, `colors.json`, and `design-token.json` define the active green/neutral system.
2. The removed `tokens/tokens.ts` defined an unused navy/gold/glass system and motion primitives.

The removed `color-token.json` duplicated an expanded color palette without any build or source consumer. The remaining CSS still duplicates some values between Tailwind `@theme`, semantic custom properties, and JSON reference files. `app/globals.css` (223 lines) and `tokens/design-tokens.css` (236 lines) are both large but cohesive enough to simplify in place rather than split.

Structural issues:

- Active code mixes semantic variables, legacy Material-like names, Tailwind utilities and arbitrary values.
- Radius families include 8, 12, 16, 24, 32 and pill values.
- Motion timing comes from CSS variables, Tailwind duration classes, `lib/motion.ts`, inline Framer transitions and GSAP timelines.
- Two reduced-motion blocks overlap in global CSS.
- `!important` appears only in the global reduced-motion safety rule and is justified.
- No CSS modules exist.
- No evidence of dead hidden-layout CSS or large commented style blocks was found.

Recommendation: keep one CSS token file as runtime truth, one human-readable source only if it is generated/validated, then migrate legacy aliases incrementally. Do not redesign colors during cleanup.

## Dependency audit

| Dependency | Classification | Evidence / decision |
| --- | --- | --- |
| `next`, `react`, `react-dom` | ESSENTIAL | Core framework/runtime |
| `@prisma/client`, `@prisma/adapter-pg`, `prisma` | ESSENTIAL | PostgreSQL persistence and generation |
| `next-auth`, `bcryptjs` | ESSENTIAL | Credentials auth and password verification |
| `zod` | ESSENTIAL | Shared validation; not consistently applied yet |
| `react-hook-form`, `@hookform/resolvers` | USEFUL | Nine forms; keep |
| `nodemailer` | USEFUL | Contact notification; keep while SMTP is required |
| `lucide-react` | USEFUL | Primary icon system |
| `react-icons` | REPLACEABLE | Used only by Footer social icons; consolidate to Lucide later |
| `framer-motion` | USEFUL BUT OVERUSED | Still used by public/admin flows; simplify before considering removal |
| `gsap` | QUESTIONABLE | Used only by global loading and Lenis bridge after dead-code removal |
| `lenis` | QUESTIONABLE | Used only by global smooth scroll; benefit does not yet justify complexity |
| Tailwind/PostCSS | ESSENTIAL | Active styling pipeline |
| TypeScript/ESLint/type packages | ESSENTIAL | Quality toolchain |
| `@types/bcryptjs` | QUESTIONABLE | May be redundant with bundled types; verify before removal |

No production dependency was removed automatically because every remaining package has at least one live runtime import or framework role. `react-dom` is a required direct React runtime dependency even though application source does not import it.

## Motion and client bundle audit

| Implementation | Classification | Reason |
| --- | --- | --- |
| Page transitions | REMOVE | Decorative global hydration with little spatial value |
| Loading screen GSAP timeline | REMOVE | Delays access and makes GSAP globally relevant |
| Lenis + GSAP ticker bridge | SIMPLIFY / REMOVE | Continuous global work; requires anchor, focus, history and reduced-motion proof |
| AI workflow scroll transforms | SIMPLIFY | Decorative x/opacity mapping; retain content, not choreography |
| Case-study reveals | MOVE TO CASE-STUDY USE ONLY | Motion should explain evidence, not animate every prose section |
| Contact/login entry fades | SIMPLIFY | Small isolated transitions are acceptable |
| Project image hover zoom | SIMPLIFY | 700ms is slow relative to the motion skill |

Cleanup removed 12 dead client animation components. The major remaining opportunity is to make case-study content, project cards, and static layout server-rendered, leaving small interactive islands for menus, forms, theme controls, and purposeful media interactions.

## CMS and database audit

| Model | Decision | Notes |
| --- | --- | --- |
| `User` | KEEP | Required for admin authentication |
| `SiteContent` | KEEP / EVOLVE | Flexible but weakly typed JSON; define keys and schemas centrally |
| `Project` | KEEP / EVOLVE | Core model; legacy narrative fields should migrate gradually into blocks |
| `ProjectImage` | KEEP | Valuable evidence/media relation |
| `CaseStudySection` | EVOLVE | Strategic extension point; add a block `type` and validated JSON payload rather than many tables |
| `Skill` | DEPRECATE / EVOLVE | Percentage proficiency is not useful senior-portfolio evidence; migrate toward capabilities |
| `Service` | DEPRECATE AFTER MIGRATION | Public services route is obsolete; inspect/export data before schema removal |
| `Testimonial` | KEEP PENDING CONTENT REVIEW | Preserve legitimate records; generic ratings are not strategically important |
| `SocialLink` | KEEP | Small operational setting |
| `ResumeExperience` | KEEP / POSSIBLY MERGE | Useful structured experience; align with resume source of truth |
| `Resume` | KEEP | Active file/version handling |
| `ContactMessage` | KEEP | Contact inbox persistence |

### Case-study evolution

Evolve `CaseStudySection` with a discriminated block type and a validated JSON payload supporting text, evidence, annotated media, comparisons, flows, trade-offs, outcomes and reflection. Keep `Project` legacy fields readable throughout a staged migration. Do not create one table per visual block.

## Admin audit

- Project creation/editing shares `ProjectForm`, which is good, but edits fetch through the local API from a client page and the form cannot manage `ProjectImage` or `CaseStudySection` records.
- Settings is a 490-line client component combining settings, social links, hero slides, three fetches, uploads and persistence. Split by responsibility, not by arbitrary file size.
- Skill and Service CRUD share visual patterns but separate modal forms and endpoints; their product purpose must be decided before consolidation.
- Testimonials and resume experiences use similar modal/form/request patterns.
- Several POST handlers parse unvalidated `request.json()` despite Zod schemas existing for the matching client form.
- Server Actions are appropriate for admin-only mutations tightly coupled to these pages; uploads and externally useful/public endpoints should remain route handlers.

Target admin workflow: Project editor with core metadata plus ordered typed case-study blocks, shared media picker/upload, explicit publish state, and server-validated mutations.

## Data fetching and server/client audit

- Homepage, Work and About use fallback constants rather than live CMS project content. The CMS therefore does not currently control the main public project experience reliably.
- Resume reads Prisma directly in a Server Component and falls back safely, but `force-dynamic` means every request queries the database.
- Contact and Navbar fetch public settings in `useEffect`, causing duplicated requests and post-hydration content changes. Read settings once on the server and pass serializable values into small client controls.
- Admin lists appropriately query Prisma on the server, while many mutations go through local API routes.
- Project edit is an entire client page because it fetches by ID and owns form state; fetch the record in a Server Component and pass initial data to a client form.
- `ProjectCard` has no state, effects or browser APIs and can become a Server Component.
- `CaseStudyLayout` is client-only mainly for animation and JSON-LD injection. Render content and metadata on the server; isolate any purposeful motion.
- `AdminHeader` does not need client execution.
- `Input` and `Textarea` do not declare client boundaries and can be used within client forms through their parent boundary.
- Broad `Providers` and `AppShell` boundaries make global animation/navigation logic available on every route, including admin.

## API, forms and validation

There are 21 API routes. Authentication checks are present on mutation handlers inspected, and admin layout/pages also verify sessions. Positive controls include bcrypt password comparison, Zod on contact/projects, and authenticated upload access.

Key issues:

- Project deletion exists as both `DELETE /api/projects/[id]` and `POST /api/projects/[id]/delete`.
- Skill, Service and Testimonial POST handlers do not apply their existing Zod schemas server-side.
- Resume-experience routes cast Prisma to `any`, masking generated-client/schema drift.
- `SiteContent.value` uses `z.any()` and is cast repeatedly; use `z.unknown()` plus key-specific schemas.
- Multiple resolver casts to `any` indicate Zod/React Hook Form type mismatch that should be fixed centrally.
- Form request/error/loading behavior is repeated.
- Contact has no visible rate limiting or anti-abuse control.
- Upload has no explicit byte limit, MIME allowlist, extension allowlist, content inspection or durable cloud storage.

## Authentication and security

No environment file is tracked by Git, and secret values were not inspected or printed. Therefore there is no confirmed committed-secret exposure.

Preventive cleanup now ignores `.env.local` and `.env.*.local` while retaining `.env.example`.

High-priority security findings:

- `lib/auth.ts` falls back to `admin@example.invalid` / `REDACTED_PLACEHOLDER_PASSWORD` when environment variables are absent. This must never be allowed in production. Replace with fail-closed configuration; retain an explicit development-only path if needed.
- Local upload validation is insufficient and local disk is not durable on Vercel-style deployments.
- Public contact submission needs rate limiting/abuse protection.
- Mutation handlers should validate server-side consistently.
- Error handling should not silently treat every database failure as empty content in admin screens.

These were not changed automatically because authentication and upload behavior are high risk.

## Image and media audit

- 35 tracked files total approximately 99.3 MiB.
- Nine duplicate hash groups were found, including multi-megabyte copies of `q1`, `Q2`, `q3`, `LANDD`, `RWRD`, `PRTFL`, and `Profileimage` assets.
- The largest asset is a 20.8 MB PNG MacBook mockup.
- Active fallback references include one PRTFL copy, one LANDD copy, RewardScreen, Profileimage, and the resume PDF.
- Database content may reference any uploaded filename, so source search alone cannot prove an upload is unused.
- `hero.jpg` and `workflow-bg.jpg` have no current source reference, but were not deleted.

Classification:

- ACTIVE: files referenced by `lib/defaults.ts`, plus any URLs found in production database records.
- ARCHIVE / CASE-STUDY EVIDENCE: unreferenced project screenshots and mockups until content review.
- SAFE TO DELETE: only exact duplicate copies proven absent from the production database and CMS settings. Database verification is required first.

## Types and duplication

- `types/next-auth.d.ts` is necessary module augmentation despite a filename-only reference scan reporting no consumer.
- Project shape is manually repeated between Prisma, validation, form props and case-study props.
- JSON settings are repeatedly cast to `any`.
- Resume-experience API routes bypass types with `prisma as any`.
- Comma-separated strings in forms map to database arrays in multiple route handlers.
- CRUD authorization/error patterns repeat across API routes.
- No multiple `cn` helper, duplicate metadata helper or duplicate modal implementation was found.

Prefer Prisma-generated types for database results, Zod-inferred input types at boundaries, and small explicit view models for public components. Avoid a universal content type or mega-component.

## Legacy and documentation audit

- No `Old`, `V2`, `Copy`, or `Backup` implementation files were found.
- Fourteen confirmed dead components were the main abandoned-experiment residue.
- `ANTIGRAVITY-MASTER-PROMPT.md` and `.agent/rules`/`.agent/skills` predate the new `skills/product-portfolio-*` system and can conflict with current direction.
- `.opencode` is local tool state with its own dependency tree and is not tracked by Git; leave user tooling untouched.
- Current tracked governance includes `AGENTS.md`, seven `.agent` rule/skill files and the master prompt. Newly created `skills/` and `docs/` are not yet tracked.

Recommended hierarchy:

```text
AGENTS.md                         engineering/product guardrails
skills/product-portfolio-taste   visual decision and QA method
skills/product-portfolio-motion  motion decision and QA method
skills/case-study-writing        future content-specific guidance
docs/portfolio-brand-system.md   brand system
docs/codebase-architecture-audit.md
docs/architecture.md             future concise living architecture
archive/                         historical prompts only if history is worth retaining
```

Do not delete old governance documents until their unique security/admin rules have been merged into `AGENTS.md`.

## Cleanup performed

### Removed

- Fourteen zero-consumer shared components listed in the component inventory.
- `tokens/tokens.ts`, an unused navy/gold/glass token and motion generation.
- `tokens/color-token.json`, an unused expanded duplicate palette.
- Stale imports and unused catch bindings in active admin/API files.

### Consolidated / protected

- Environment ignore policy now explicitly covers local environment variants and keeps `.env.example` available.
- No new abstraction was added.

### Preserved deliberately

- Every public/admin/API route.
- All Prisma models, migrations and production-facing fields.
- Authentication and authorization behavior.
- Contact persistence/email behavior.
- Upload behavior and all public assets.
- Active UI and motion, even when recommended for later simplification.
- CMS forms and settings behavior.

## Risk-ranked next cleanup plan

### Low risk

- Finish lint cleanup: replace unnecessary `any`, align form resolver types, remove stale seed destructuring.
- Merge duplicate reduced-motion CSS blocks and prune verified unused CSS variables with automated reference checks.
- Convert `ProjectCard` and `AdminHeader` to Server Components.
- Add key-specific schemas for `SiteContent` values.
- Add server-side validation to Skill, Service and Testimonial handlers.
- Add tests for validation and authorization before deeper changes.

### Medium risk

- Remove global page transition/loading animation and then remove GSAP if Lenis is also retired.
- Retire Lenis after keyboard, focus, anchor and history behavior comparison.
- Server-render Navbar settings and Contact settings.
- Convert project edit data loading to a Server Component.
- Consolidate duplicate project deletion routes.
- Move tightly coupled admin mutations to Server Actions.
- Split Settings by settings/social/hero responsibility.
- Establish a single public content service so fallback and CMS data do not diverge.
- Make `/services` a permanent compatibility redirect and remove its CMS UI only after data review.

### High risk — approval and migration required

- Fail closed on missing production admin credentials and revise fallback authentication.
- Add durable object storage/Cloudinary-backed uploads, validation and migration of existing URLs.
- Evolve `CaseStudySection` to typed block payloads and migrate legacy Project narrative fields.
- Replace Skill proficiency with capability/evidence architecture.
- Deprecate and eventually drop Service fields/table.
- Remove or deduplicate media after querying every production reference.
- Change caching/revalidation for CMS-backed public pages.

## New target architecture

```text
app/
├── (portfolio)/
│   ├── page.tsx
│   ├── work/page.tsx
│   ├── work/[slug]/page.tsx
│   ├── about/page.tsx
│   ├── resume/page.tsx
│   └── contact/page.tsx
├── admin/                    authenticated CMS routes
└── api/                      only public/external or upload boundaries

components/
├── ui/                       small accessible primitives
├── layout/                   mostly server-rendered shell + interactive islands
├── portfolio/                hero, project index, authored sections
├── case-study/               typed block renderers
└── admin/                    focused editors and media controls

lib/
├── auth.ts
├── db.ts
├── content/                  typed server-side queries/view models
├── validation/               boundary schemas
└── utilities.ts

tokens/
└── design-tokens.css         one runtime source of truth
```

The exact folders should emerge during migration; the important boundary is server-rendered editorial content with small interactive islands, not folder renaming.

## Performance opportunities

The initial build passes, but route-specific bundle sizes are not emitted by the current Next build output. Highest-confidence improvements are:

1. Remove global loading/page-transition/scroll libraries from the root tree.
2. Server-render case-study prose and ProjectCard.
3. Stop client-fetching settings in Navbar and Contact.
4. Optimize or move the 20.8 MB PNG and other large evidence assets to durable image storage.
5. Remove exact asset duplicates only after database-reference verification.
6. Avoid hydrating static case-study data solely for JSON-LD and reveal effects.

### After low-risk cleanup

- Repository files in the measured scope: 147, down from 161.
- Shared TSX components: 24, down from 38 (36.8% fewer).
- Explicit client files: 29, down from 41 (29.3% fewer source client boundaries).
- Deleted source: 1,312 lines, with 14 lines added to existing tracked files.
- Direct dependency count: unchanged at 30; dead files were not sufficient evidence to remove the remaining live libraries.
- Optimized production build: passes, with all routes generated successfully.
- Lint: improved from 39 findings (18 errors, 21 warnings) to 20 findings (17 errors, 3 warnings). Remaining findings are documented type/effect debt, not introduced regressions.
- `.next/static` JavaScript: 1,464,886 bytes versus 1,464,889 before. The near-zero output change confirms the deleted components were already tree-shaken; the value of this cleanup is source clarity and maintenance, while bundle reduction requires changing live client boundaries.

## Risks and fragility

- Default admin credentials can become active if environment configuration is missing.
- Uploads to `public/uploads` are not durable on many production platforms.
- CMS project content and public fallback content can diverge.
- Case-study editing does not expose the schema's section/image capability.
- Broad client boundaries and three motion libraries raise bundle and lifecycle complexity.
- Lint is not clean, so regressions can hide among existing failures.
- Large duplicated assets inflate repository and deployment size.
- Database errors are frequently swallowed into fallback/empty states, reducing operational visibility.

## Completion status

Low-risk dead-code cleanup is implemented. Medium- and high-risk work remains intentionally deferred. Production content, CMS behavior, routes, database schema, security behavior and media are unchanged.

## Phase 2 hardening update

Phase 2 removed the insecure default credential, moved new uploads to signed server-side Cloudinary delivery with strict file validation, protected contact submission, removed global decorative motion, eliminated GSAP and Lenis, server-rendered case-study content, added a non-destructive typed-block schema/migration and admin/API foundation, made `/services` a permanent capabilities redirect, and resolved all lint findings.

The external database migration, public CMS cutover, Skill/Capability migration, Service archival and media deduplication remain approval-gated. See `docs/architecture-hardening-report.md` for evidence, verification and deployment sequencing.
