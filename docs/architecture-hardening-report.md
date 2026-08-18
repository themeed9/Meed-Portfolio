# Phase 2 Architecture Hardening Report

## 1. Security changes

- Removed the usable `REDACTED_PLACEHOLDER_PASSWORD` and default-email authentication fallback.
- Runtime authentication is database-only. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are limited to explicit maintenance/seed tooling and cannot bypass the database login path.
- Database-backed bcrypt authentication and Auth.js JWT/session protections remain intact.
- Seed creation now requires both explicit admin values and otherwise creates no user.
- `.env.example` contains blank credential placeholders, not working credentials.
- Credentials and secret values were never printed or copied into source.

The configured external database was not mutated during this phase.

## 2. Upload changes

`POST /api/upload` no longer writes to `public/uploads`. It uploads to the already-configured Cloudinary account entirely from the server.

Controls added:

- Authenticated access remains mandatory.
- Allowed images: JPG/JPEG, PNG, WebP and AVIF.
- Allowed documents: PDF.
- MIME and extension must agree.
- Magic-byte/file-signature checks reject disguised content.
- Images are capped at 12 MB; PDFs at 5 MB.
- Empty files and unsupported formats return explicit errors.
- Random UUID public IDs replace user-controlled filenames.
- Images and resumes use separate Cloudinary folders/resource types.
- Cloudinary API secret remains server-only; signed upload parameters are generated server-side.
- Missing Cloudinary configuration fails with 503 rather than falling back to ephemeral disk.
- Existing URLs and files are preserved unchanged.

The existing Project, Settings and Resume upload clients continue consuming the same `{ url }` response contract.

## 3. Contact protection

- Zod now trims and bounds name, email, subject and message lengths.
- Requests are capped at 20 KB before JSON parsing.
- A visually hidden honeypot field rejects automated form filling without changing the visible experience.
- IP-based throttling allows five submissions per 15 minutes per running instance.
- A SHA-256 submission fingerprint rejects an identical IP/email/message submission for 60 seconds.
- Malformed JSON and validation failures are rejected before persistence or email.
- SMTP notification and database persistence remain unchanged.

The limiter is intentionally simple and in-memory. On horizontally scaled/serverless deployments it is per-instance, so a durable edge/KV limiter remains a future option if abuse becomes measurable. CAPTCHA was not added.

## 4. Motion and bundle simplification

| System | Decision | Result |
| --- | --- | --- |
| Artificial loading screen | REMOVE | Deleted; content is immediately available |
| Global page transition | REMOVE | Deleted; navigation is no longer blocked by decorative animation |
| Global Lenis smooth scrolling | REMOVE | Deleted; native history, anchor, keyboard and focus scrolling restored |
| Global GSAP/ScrollTrigger bridge | REMOVE | Deleted with Lenis integration |
| GSAP dependency | REMOVE | No live consumer remained |
| Lenis dependency | REMOVE | No live consumer remained |
| Case-study prose reveals | REMOVE | Case-study content now renders on the server without viewport animation |
| Local Framer Motion | KEEP/SIMPLIFY LATER | Limited to contact, login, resume reveal and AI workflow |

The motion skill determined that the removed systems had no explanatory purpose and delayed or globally modified reading. Reduced-motion CSS and local `useReducedMotion` behavior remain.

## 5. CaseStudySection evolution

The schema migration is additive and non-destructive:

- `type String @default("rich_text")`
- `eyebrow String?`
- `payload Json?`
- `metadata Json?`
- `updatedAt DateTime @updatedAt`

Existing `title`, `content`, media fields, IDs and ordering remain. Existing rows automatically remain valid `rich_text` blocks.

Architecture added:

- A closed section-type vocabulary containing the requested future block families.
- Zod boundary validation for section creation/update.
- Specific payload validation for TLDR, decision, before/after, evidence, trade-off, outcome, gallery and rich text.
- A renderer registry rather than a single giant switch.
- Safe fallback to existing content for unknown, unsupported or invalid payloads.
- Server-rendered case-study layout, blocks and JSON-LD.
- Authenticated create, update, delete and reorder endpoints scoped to a project.
- A basic block editor in the existing project edit route, including type, title, eyebrow, fallback content, structured JSON payload, removal and reorder.

Migration file: `prisma/migrations/20260814000000_evolve_case_study_sections/migration.sql`.

Important deployment gate: the migration was generated and Prisma Client regenerated, but the external database migration was not applied automatically. Deploy the migration before deploying code that queries the new columns.

The public `[slug]` route still uses curated fallback project data. Switching it to live CMS records is deferred because the production database currently contains older positioning/content and changing the source would alter the published portfolio.

## 6. Services strategy

- `/services` is now a permanent compatibility redirect to `/about#capabilities`.
- The About capability section now exposes that anchor.
- Services was removed from the sitemap.
- No primary navigation link existed.
- The Service model, API and admin data remain intact and are formally legacy pending migration approval.

## 7. Skill-model recommendation

Keep the existing `Skill` rows unchanged until a non-destructive migration is approved. Recommended replacement:

```text
Capability
- id
- name
- category
- description
- evidence (structured JSON or references)
- relatedProjects (relation)
- priority
- createdAt / updatedAt
```

Migration sequence:

1. Add Capability and optional project relation without changing Skill.
2. Export/review existing Skill rows; do not convert percentages into invented claims.
3. Create capabilities from reviewed names/categories and authored evidence.
4. Update admin/public consumers.
5. Archive Skill data.
6. Drop Skill only in a later approved migration.

## 8. Media duplicate findings

Database references were queried read-only across Project covers, ProjectImage, Resume, Testimonial avatars and SiteContent JSON. Source fallbacks were also inspected. No file was deleted or reference changed.

### SAFE_TO_DEDUPLICATE after an approved reference update

- Screenshot pair: `1781696118826-...` is database-referenced; `1781688492894-...` is the unreferenced copy.
- LANDD trio: `1781788102997-...` and `1782128844597-...` are referenced; `1781789680653-...` is unreferenced. The two references could later converge on the active fallback copy.
- q3 pair: `1782128916004-...` is referenced; `1781813346015-...` is not.
- q1 pair: `1782128883001-...` is referenced; `1781813364845-...` is not.
- Q2 pair: `1782128902172-...` is referenced; `1781813535511-...` is not.
- RWRD trio: `1782128860988-...` is referenced; `1781814096885-...` and `1781814151047-...` are not.
- PRTFL pair: `1782128853745-...` is referenced by CMS and fallbacks; `1781814422679-...` is not.

These unreferenced exact copies are technically replaceable, but deletion remains deferred because they may be intentional case-study evidence/history.

### DO_NOT_TOUCH

- Profileimage pair: `1782129629769-...` is CMS-referenced and `1782129256804-...` is fallback-referenced. Both currently have active consumers.

### UNKNOWN / archive

- Duplicate `logotest.jpg` files have no source or database reference, but their future evidence value is unknown.
- Any URL embedded outside the queried fields or in external Cloudinary transformations was not proven.

## 9. Lint and type fixes

- Removed all remaining explicit `any` usages reported by ESLint.
- Replaced stale Prisma-client casts with generated model access.
- Added one typed resolver compatibility helper for Zod 4 and React Hook Form.
- Replaced broad JSON casts with guarded unknown/object checks.
- Fixed theme initialization effect scheduling without changing theme behavior.
- Removed stale seed destructuring warnings.
- Added typed Zod validation to block and reorder mutations.

Result: ESLint improved from 20 findings to zero. TypeScript passes with strict settings.

## 10. Build and test results

- `npx prisma generate`: PASS.
- `npx tsc --noEmit`: PASS.
- `npm run lint`: PASS, zero findings.
- `npm run build`: PASS, including all public/admin/API route compilation and static generation.
- Automated test suite: none is configured in `package.json`.
- Read-only production media-reference query: PASS.
- Live local HTTP smoke runner: unable to bind the requested local port in the current desktop shell; no route failure was inferred from this. The production build successfully generated every route.
- Mutating admin CRUD, upload, contact and migration operations were not executed against production, avoiding data creation/deletion and outbound email during verification.

## 11. Remaining risks

- The additive Prisma migration must be deployed before the new section APIs are used in production.
- In-memory contact throttling is not globally distributed.
- Cloudinary upload behavior requires valid server environment configuration and should receive a post-deploy authenticated smoke test.
- Existing local `/uploads` assets remain a deployment/repository burden.
- Public project pages remain disconnected from live CMS project rows.
- Skill, Service and legacy Project narrative fields remain pending migration decisions.
- The typed block editor accepts JSON directly; a future editor should provide type-specific fields without changing the storage contract.
- Framer Motion still powers several local decorative effects, especially AI workflow.

## 12. Decisions requiring approval

1. Apply the new Prisma migration to the configured external database.
2. Decide whether public project pages should switch from curated fallback data to published CMS data, including a content reconciliation pass.
3. Approve a Capability migration and eventual Skill deprecation.
4. Approve Service data archival and later model/API/admin removal.
5. Approve canonical media substitutions and deletion/archive policy for exact duplicates.
6. Decide whether contact volume warrants a distributed limiter.
7. Approve replacement of the JSON block editor with type-specific admin controls during the design-system phase.

## Stop condition

Architectural hardening is complete. No homepage, navigation, case-study visual, Resume, Contact, GoFinancial presentation or new motion redesign was started.
