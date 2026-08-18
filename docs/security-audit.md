# MEED Portfolio Security Audit

Audit date: 2026-08-15  
Scope: repository source, API routes, admin routes, Auth.js configuration, Prisma schema and queries, CMS rendering, uploads, contact flow, environment handling, Git history signals, response headers, and dependency lockfile.  
Method: static code review, local HTTP checks, tracked-file/history inspection without printing values, `npm audit`, package-tree inspection, and post-hardening build/runtime verification.

No credentials are reproduced in this report. The original findings below are retained as the before-state; the authoritative post-hardening score is recorded in **Post-hardening re-score** at the end of this document.

Current release state: **BLOCKED — OWNER ACTION REQUIRED**. Code-level P0 remediation is complete, but exposed credentials must be rotated and the old credentials revoked before deployment.

## Executive summary

The application has several strong controls: server-side Prisma access, bcrypt hashing for database users, authenticated mutations, project-scoped block/media updates, bounded contact input, upload magic-byte checks, React text escaping, and published-only server-rendered portfolio queries.

The repository is not ready for production until two P0 classes of risk are handled:

1. `.env.local` is tracked, contains populated sensitive configuration, and appears in multiple historical commits. Exposure is confirmed at the repository level; all affected credentials must be treated as compromised and rotated.
2. The installed authentication dependency tree contains critical/high advisories. `next-auth@5.0.0-beta.31` resolves `@auth/core@0.41.2`, which is below the fixed range reported by `npm audit`.

Additionally, unauthenticated project API reads return unrestricted records by list/ID in code, including unpublished projects and case-study sections. Public pages correctly use published-only queries, but the API bypasses that protection.

## Control summary

| # | Control | Status | Evidence | Risk | Recommended Action |
|---|---|---|---|---|---|
| 1 | Hide API keys | FAIL | `.env.local` is tracked and contains populated sensitive variables; secrets otherwise use server-only names except intentionally public variables. | Critical credential disclosure through repository access. | Remove the tracked file, expand ignore rules, rotate exposed credentials, and add secret scanning. |
| 2 | Purge Git secrets | FAIL | `.env.local` exists in at least seven commits. Classification: **HISTORY EXPOSURE CONFIRMED**. | Historical clones retain credentials after a normal deletion. | Rotate first; then perform approved history cleanup and invalidate old clones/caches. |
| 3 | Safe public database keys only | NOT APPLICABLE | Prisma and `DATABASE_URL` are server-only. No browser database client exists. Unused public Supabase variables are present in tracked environment configuration. | Direct browser database access is not part of the architecture; unnecessary public configuration increases confusion. | Remove unused public database variables after confirming no deployment dependency. |
| 4 | Row/record-level security | PARTIAL | Mutations call `auth()` and media/section child updates include `projectId`; public project GET routes do not enforce `published`. | Draft projects and blocks can be read without authentication. | Split public published DTO routes from authenticated admin detail routes. |
| 5 | Encrypt sensitive data | UNKNOWN | DB passwords are bcrypt-hashed; contacts are stored as plaintext; provider encryption-at-rest settings are not represented in code. | Contact messages and addresses depend on provider controls and access security. | Verify PostgreSQL, backup, Cloudinary, and Vercel encryption/retention settings; do not add application encryption without a concrete need. |
| 6 | Enforce server-side auth | PARTIAL | All observed mutations authenticate server-side; several admin pages render with HTTP 200 unauthenticated, and project read APIs are public. | Admin UI exposure aids enumeration; draft reads bypass intended admin boundary. | Add centralized admin route protection and protect admin project reads. |
| 7 | Lock record access | FAIL | Section/image mutations scope child ID to project ID, but `/api/projects` and `/api/projects/[id]` expose all records without auth. | IDOR-style read access to unpublished project content. | Require auth for ID-based admin reads; public reads must query `published: true` by slug and return explicit DTOs. |
| 8 | Block field tampering | PARTIAL | Project updates whitelist fields; sections use Zod; settings/social/resume/skills/services/testimonials and raw site content accept weakly validated body values. | Authenticated compromise or CSRF can persist malformed/unexpected data and unsafe URLs. | Apply strict schemas and explicit field selection to every mutation. |
| 9 | Secure session cookies | PASS | No custom cookie weakening. Auth.js defaults in installed source set HttpOnly, SameSite=Lax, `/` path, Secure on HTTPS, CSRF double-submit checks, and 30-day JWT expiry. | Residual risk comes from dependency advisories and a relatively long admin session. | Upgrade Auth.js; consider a shorter explicit admin session after usability review. |
| 10 | Hash passwords | PARTIAL | Prisma seed hashes with bcrypt cost 12 and authorization uses `bcrypt.compare`; environment credential fallback compares a plaintext environment secret. | Database storage is strong; the tracked environment fallback credential is exposed and bypasses hash storage. | Rotate/remove the exposed fallback and prefer DB-only hashed credentials or a managed identity provider. |
| 11 | Rate limit login | FAIL | No throttling in `lib/auth.ts` or the credentials callback. | Online password guessing and credential stuffing against the admin login. | Add small server-side IP + normalized-identifier throttling with cooldown and generic errors. |
| 12 | Bot protection | PARTIAL | Contact has honeypot, 5/15-minute IP limit, duplicate fingerprint suppression, and body bounds. Login is unthrottled; limiter is per-process memory. | Limits reset across instances/restarts and do not protect login. | Preserve contact controls, add login throttling, and use a shared limiter only if deployment behavior requires it. |
| 13 | Parameterize DB queries | PASS | Prisma query APIs are used; no `$queryRawUnsafe`, `$executeRawUnsafe`, string-built SQL, or raw user-interpolated SQL was found. | Low SQL injection risk at current query layer. | Keep Prisma APIs and review any future raw SQL separately. |
| 14 | Validate all input | PARTIAL | Contact, project, resume experience, media metadata, and sections have some Zod validation; many limits/URL/slug schemas are incomplete and several handlers have no server schema. | Oversized/malformed content, unsafe schemes, invalid slugs, and inconsistent records. | Add bounded schemas per endpoint and block type; validate route IDs and URL schemes. |
| 15 | Escape/sanitize user content | PARTIAL | Public CMS text renders as React text; no CMS HTML sink exists. JSON-LD uses `JSON.stringify`. Contact values are interpolated unescaped into notification HTML; CMS URLs feed links/images without scheme allowlists. | HTML injection in notification email and unsafe-link persistence. | HTML-escape email fields and validate `https:`/allowed internal paths for stored URLs. |
| 16 | Restrict file uploads | PARTIAL | Upload requires auth; validates MIME, extension, size, magic bytes; randomizes names; signs Cloudinary upload server-side; uses HTTPS. One endpoint accepts both images and PDFs regardless of caller context. | A compromised admin can place the wrong resource type in a workflow; image resource complexity and stale Cloudinary assets remain. | Require an upload purpose, enforce image/PDF policy per purpose, set transformation limits, and design authenticated safe deletion. |
| 17 | Trim API responses | FAIL | Public project routes return raw records with images/sections and no publication filter; public settings merges and returns contact email. Protected contact GET returns full message records appropriately to an authenticated admin. | Draft/internal data and configured contact address may be exposed unnecessarily. | Use explicit public/admin DTOs and remove private fields from public settings responses. |
| 18 | Security headers | FAIL | `next.config.ts` defines images only; local response inspection showed no CSP, nosniff, Referrer-Policy, Permissions-Policy, HSTS, frame protection, or cross-origin policy. | Clickjacking, MIME sniffing, excessive referrer leakage, and weaker XSS blast-radius reduction. | Add a staged header baseline, then a tested CSP compatible with Next.js/Auth.js/Cloudinary. |
| 19 | Force HTTPS | PARTIAL | Asset and Cloudinary uploads use HTTPS; Auth.js sets Secure cookies when request URL is HTTPS. No repository-level redirect/HSTS exists; Vercel deployment behavior was not verified in this audit. | Misconfigured custom hosting could permit HTTP or non-Secure cookies. | Verify Vercel HTTPS redirects and domain configuration; add HSTS only after HTTPS is confirmed everywhere. |
| 20 | Scan dependencies | FAIL | `npm audit`: 15 total findings (2 critical, 8 high, 5 moderate); production-only scan: 13 total (2 critical, 6 high, 5 moderate). | Known vulnerabilities in authentication, mail, image processing, Next.js transitive tooling, and other packages. | Upgrade the smallest compatible versions and retest auth, email, image optimization, build, and CMS flows. |

## Detailed control evidence

### 1. Hide API keys

**STATUS:** FAIL  
**EVIDENCE:** `.env.local` is returned by `git ls-files`. A value-redacted inventory confirmed populated `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CONTACT_EMAIL`, and public service variables. Server secrets are referenced through `process.env` in server modules. No secret is intentionally prefixed `NEXT_PUBLIC_`; the public site URL/cloud name/public publishable key are non-secret by definition, although some are unused.  
**FILES / ROUTES:** `.env.local`, `.env.example`, `.gitignore`, `lib/auth.ts`, `lib/prisma.ts`, `lib/email.ts`, `app/api/upload/route.ts`, `prisma/seed.ts`.  
**CURRENT BEHAVIOR:** Sensitive configuration is server-consumed but committed to source control.  
**RISK:** Anyone with repository/history access may use live credentials.  
**RECOMMENDATION:** Rotate every populated secret from the tracked file, remove it from tracking, ignore `.env*` with an explicit `!.env.example`, and add push/CI scanning.  
**CHANGE REQUIRED:** YES

### 2. Purge Git secrets

**STATUS:** FAIL — CURRENT SOURCE NOT CLEAN; HISTORY EXPOSURE CONFIRMED  
**EVIDENCE:** `.env.local` is present in at least commits `f4754bdc`, `c429ba89`, `25040a08`, `b8fbeae9`, `50b4bc4c`, `e53bc3b6`, and `1e318b71`. Values were not printed.  
**FILES / ROUTES:** Git objects containing `.env.local`.  
**CURRENT BEHAVIOR:** Removing the current file alone would not remove historical copies.  
**RISK:** Old commits, forks, PR artifacts, caches, and clones retain credentials.  
**RECOMMENDATION:** Rotate credentials before any cleanup. After explicit approval, use a history-rewrite tool, force-push coordinated branches, invalidate caches where possible, and notify collaborators to re-clone.  
**CHANGE REQUIRED:** YES

### 3. Use safe public database keys only

**STATUS:** NOT APPLICABLE — SERVER-SIDE DATABASE ACCESS ONLY  
**EVIDENCE:** `lib/prisma.ts` constructs Prisma with server-only `DATABASE_URL`; no Supabase/browser database SDK or unrestricted DB proxy was found.  
**FILES / ROUTES:** `lib/prisma.ts`, `prisma.config.ts`, `prisma/schema.prisma`, `lib/portfolio-content.ts`.  
**CURRENT BEHAVIOR:** Browser code calls application APIs; only the server calls PostgreSQL.  
**RISK:** No direct browser DB credential risk in the application. Unused public Supabase variables create configuration ambiguity.  
**RECOMMENDATION:** Keep Prisma server-only and remove unused public DB configuration after confirming it is not used externally.  
**CHANGE REQUIRED:** NO for architecture; YES for cleanup if confirmed unused.

### 4. Enable row-level / record-level security

**STATUS:** PARTIAL  
**EVIDENCE:** All inspected writes check `auth()`. Section/image update/delete uses both child ID and parent `projectId`, preventing cross-project child-ID substitution. Public `GET /api/projects` uses no `published` predicate; `GET /api/projects/[id]` returns any project by ID with sections/images.  
**FILES / ROUTES:** `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`, `app/api/projects/[id]/sections/**`, `app/api/projects/[id]/images/**`, `lib/portfolio-content.ts`.  
**CURRENT BEHAVIOR:** Public pages are correctly publication-scoped, but public APIs are not.  
**RISK:** Draft/unpublished records are readable outside the CMS.  
**RECOMMENDATION:** Keep server authorization as the record-level layer; do not add PostgreSQL RLS solely for this single-admin architecture. Enforce `published: true` on public reads and authentication on admin reads.  
**CHANGE REQUIRED:** YES

### 5. Encrypt sensitive data

**STATUS:** UNKNOWN  
**EVIDENCE:** `User.password` stores a bcrypt hash. `ContactMessage` stores name, email, subject, and message without application-level encryption. Provider encryption, backup encryption, retention, and access logs are deployment controls not represented in the repository.  
**FILES / ROUTES:** `prisma/schema.prisma`, `prisma/seed.ts`, `app/api/contact/route.ts`.  
**CURRENT BEHAVIOR:** Authentication secrets are hashed in DB; contact content is ordinary database plaintext protected by server authorization.  
**RISK:** A database/backup compromise exposes contact correspondence.  
**RECOMMENDATION:** Verify provider encryption at rest, backups, least-privilege DB access, and retention/deletion. Application field encryption is optional unless message sensitivity or compliance warrants key-management complexity.  
**CHANGE REQUIRED:** NO until deployment evidence establishes a gap.

### 6. Enforce server-side auth

**STATUS:** PARTIAL  
**EVIDENCE:** Mutation handlers consistently call `auth()` before writes. `/api/content`, `/api/media`, and contact-message GET return 401 unauthenticated in local tests. `app/admin/layout.tsx` does not redirect unauthenticated requests; local checks returned 200 for `/admin/settings`, `/admin/projects/new`, and `/admin/projects/example/edit`. Several individual server pages redirect, but client-only admin pages rely on API failures.  
**FILES / ROUTES:** `app/admin/layout.tsx`, `app/admin/**`, `app/api/**`, `lib/auth.ts`.  
**CURRENT BEHAVIOR:** Writes are server-protected; parts of the CMS shell/UI are publicly renderable.  
**RISK:** UI/field enumeration, draft reads through public project APIs, and inconsistent future-route protection.  
**RECOMMENDATION:** Add centralized `/admin` route guarding while explicitly allowing `/admin/login`; retain handler-level authorization as defense in depth.  
**CHANGE REQUIRED:** YES

### 7. Lock record access

**STATUS:** FAIL  
**EVIDENCE:** Public ID-based project read returns the raw project including `caseStudySections`; list read includes all projects. Child mutations correctly use `updateMany/deleteMany` with both IDs. Contact and media library reads authenticate.  
**FILES / ROUTES:** `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`, `app/api/contact/route.ts`, `app/api/media/route.ts`, project child routes.  
**CURRENT BEHAVIOR:** Guessing/obtaining a project CUID can retrieve an unpublished record; listing may disclose IDs directly.  
**RISK:** Confirmed code-level IDOR read path for protected drafts.  
**RECOMMENDATION:** Authenticate ID reads used by the editor; expose published projects by validated slug through a separate DTO.  
**CHANGE REQUIRED:** YES

### 8. Block field tampering

**STATUS:** PARTIAL  
**EVIDENCE:** Project create/update explicitly maps validated fields; section/media schemas constrain accepted keys. `SiteContent.value` accepts arbitrary JSON; settings, slides, social links, resume, skills, services, and testimonials do not consistently use strict server schemas or length limits.  
**FILES / ROUTES:** `lib/validations.ts`, `lib/case-study.ts`, `app/api/content/**`, `app/api/settings/route.ts`, `app/api/hero-slides/route.ts`, `app/api/social-links/route.ts`, `app/api/resume/route.ts`, skills/services/testimonials routes.  
**CURRENT BEHAVIOR:** Authentication limits attackers, but a stolen session or same-origin exploit can persist unexpected values.  
**RISK:** Malformed CMS state, stored unsafe URLs, oversized content, and future privilege-field mistakes.  
**RECOMMENDATION:** Define strict endpoint schemas and map validated fields explicitly. Use key-specific schemas for known `SiteContent` entries.  
**CHANGE REQUIRED:** YES

### 9. Secure session cookies

**STATUS:** PASS  
**EVIDENCE:** `lib/auth.ts` does not override cookie defaults. Installed Auth.js code sets session/CSRF/callback cookies HttpOnly, SameSite=Lax, path `/`, and Secure when HTTPS; CSRF double-submit validation is enabled. JWT sessions expire after the default 30 days. No session token is stored in localStorage.  
**FILES / ROUTES:** `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, installed `@auth/core/lib/utils/cookie.js` and `lib/init.js`.  
**CURRENT BEHAVIOR:** Secure framework defaults apply when production requests are HTTPS.  
**RISK:** Dependency vulnerabilities and a long-lived admin session remain; local HTTP correctly omits Secure for development.  
**RECOMMENDATION:** Upgrade Auth.js and consider an explicit shorter session duration appropriate for a single-admin CMS.  
**CHANGE REQUIRED:** NO for cookie flags; YES for dependency upgrade.

### 10. Hash passwords

**STATUS:** PARTIAL  
**EVIDENCE:** `prisma/seed.ts` uses `bcrypt.hash(password, 12)` and `lib/auth.ts` uses `bcrypt.compare`. Passwords are not logged or stored client-side. The environment credential fallback compares `ADMIN_PASSWORD` directly and that variable is in the tracked environment file.  
**FILES / ROUTES:** `prisma/seed.ts`, `lib/auth.ts`, `.env.local`.  
**CURRENT BEHAVIOR:** Database credentials are correctly hashed; environment fallback is a plaintext secret by design.  
**RISK:** Exposed fallback credential grants admin access independently of the hashed DB record.  
**RECOMMENDATION:** Rotate immediately and remove the environment-password fallback after ensuring DB authentication reliability, or replace it with a managed identity path.  
**CHANGE REQUIRED:** YES

### 11. Rate limit login

**STATUS:** FAIL  
**EVIDENCE:** Credentials `authorize()` performs DB/hash checks and fallback comparison with no attempt counter, delay, cooldown, or provider/WAF rule evidenced in code.  
**FILES / ROUTES:** `lib/auth.ts`, `/api/auth/**`, `/admin/login`.  
**CURRENT BEHAVIOR:** Unlimited login attempts are accepted subject only to platform capacity.  
**RISK:** Credential stuffing and brute-force attacks against a known single-admin endpoint.  
**RECOMMENDATION:** Add conservative IP + normalized email throttling and exponential cooldown; preserve generic errors and recovery access.  
**CHANGE REQUIRED:** YES

### 12. Add bot protection

**STATUS:** PARTIAL  
**EVIDENCE:** Contact endpoint enforces request/body bounds, honeypot, IP rate limit, and one-minute duplicate fingerprint suppression. `lib/rate-limit.ts` uses an in-memory Map. Login has no bot controls. Uploads require authentication.  
**FILES / ROUTES:** `app/api/contact/route.ts`, `lib/rate-limit.ts`, `components/contact/ContactForm.tsx`, `lib/auth.ts`, `app/api/upload/route.ts`.  
**CURRENT BEHAVIOR:** Contact abuse is mitigated per process; serverless instances/restarts do not share counters.  
**RISK:** Distributed abuse can bypass local buckets; login remains exposed.  
**RECOMMENDATION:** Add login throttling first. Move contact limits to a shared store or WAF only if production telemetry shows multi-instance bypass. CAPTCHA is not currently justified.  
**CHANGE REQUIRED:** YES for login; conditional for contact.

### 13. Parameterize database queries

**STATUS:** PASS  
**EVIDENCE:** Search found no raw/unsafe query APIs. All DB operations use Prisma structured filters/data.  
**FILES / ROUTES:** `lib/prisma.ts`, `lib/portfolio-content.ts`, all `app/api/**` handlers.  
**CURRENT BEHAVIOR:** Prisma parameterizes generated SQL.  
**RISK:** Low at present.  
**RECOMMENDATION:** Prohibit `$queryRawUnsafe`/`$executeRawUnsafe` in review or lint policy.  
**CHANGE REQUIRED:** NO

### 14. Validate all input

**STATUS:** PARTIAL  
**EVIDENCE:** Strong contact bounds and typed section enum exist. `projectSchema` lacks upper bounds, slug pattern/reserved words, and URL protocols; media URL schemas use `min(1)` rather than URL allowlists; payload nested strings are generally unbounded; multiple CRUD handlers bypass their existing schemas. Route IDs are unconstrained strings.  
**FILES / ROUTES:** `lib/validations.ts`, `lib/case-study.ts`, API routes listed under control 8.  
**CURRENT BEHAVIOR:** Some primary inputs are validated; coverage and bounds are inconsistent.  
**RISK:** Stored malformed URLs/content, excessive DB/email payloads, and route ambiguity.  
**RECOMMENDATION:** Add strict bounded schemas per route; allow `https:` plus intentional internal paths; use a lowercase slug regex and reserved-path denylist.  
**CHANGE REQUIRED:** YES

### 15. Escape / sanitize user content

**STATUS:** PARTIAL  
**EVIDENCE:** Case-study rich text is parsed into React text nodes; no CMS `dangerouslySetInnerHTML` exists. Static theme script is fixed source. JSON-LD is serialized, but CMS text containing `</script>` should be defensively escaped before embedding. Contact `name`, `email`, `subject`, and `message` are directly interpolated into email HTML.  
**FILES / ROUTES:** `components/projects/CaseStudySection.tsx`, `components/projects/CaseStudyLayout.tsx`, `app/layout.tsx`, `lib/email.ts`.  
**CURRENT BEHAVIOR:** Browser-rendered text is escaped by React; email HTML is not escaped.  
**RISK:** Stored HTML injection in notification emails and potential script-element termination in CMS-derived JSON-LD.  
**RECOMMENDATION:** Escape all email HTML fields; use a safe JSON-LD serializer that replaces `<`; validate link schemes.  
**CHANGE REQUIRED:** YES

### 16. Restrict file uploads

**STATUS:** PARTIAL  
**EVIDENCE:** Auth is required; JPG/JPEG/PNG/WebP/AVIF/PDF extensions must match MIME; size is capped at 12 MB images/5 MB PDF; signatures are checked; random UUID names and signed server-side Cloudinary requests are used; PDFs use `raw`, images use `image`. API secret remains server-side.  
**FILES / ROUTES:** `app/api/upload/route.ts`, admin upload components, `next.config.ts`.  
**CURRENT BEHAVIOR:** One generic endpoint accepts either image or PDF; caller purpose is not declared/enforced. Removal detaches DB references but does not delete Cloudinary assets.  
**RISK:** Wrong-type workflow attachment, storage accumulation, and residual parser/decompression risk.  
**RECOMMENDATION:** Add an authenticated purpose enum (`resume` or `image`), enforce type per purpose, consider pixel/dimension limits, and implement reference-aware Cloudinary deletion later.  
**CHANGE REQUIRED:** YES

### 17. Trim API responses

**STATUS:** FAIL  
**EVIDENCE:** Project list/detail uses raw Prisma objects and includes draft state, child media, and sections. Settings GET includes the configured/fallback `contactEmail`. Media uses an explicit select and contact messages are auth-protected. Session callback returns role/id in addition to standard user data, appropriate for the CMS.  
**FILES / ROUTES:** `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`, `app/api/settings/route.ts`, `app/api/media/route.ts`, `lib/auth.ts`.  
**CURRENT BEHAVIOR:** Public consumers receive more data than required.  
**RISK:** Draft leakage and unnecessary personal/contact data exposure.  
**RECOMMENDATION:** Create explicit public DTOs; make settings public response omit contact destination unless intentionally displayed, with a separate authenticated admin settings response.  
**CHANGE REQUIRED:** YES

### 18. Add security headers

**STATUS:** FAIL  
**EVIDENCE:** `next.config.ts` has no `headers()` configuration. Local header inspection returned only normal HTTP response metadata and none of the requested security headers.  
**FILES / ROUTES:** `next.config.ts`, all responses.  
**CURRENT BEHAVIOR:** Browser defaults provide the only header-level protection.  
**RISK:** Clickjacking, MIME sniffing, referrer leakage, permissive capabilities, and larger XSS impact.  
**RECOMMENDATION:** Stage `nosniff`, Referrer-Policy, Permissions-Policy, and frame protection first. Design CSP from observed assets and Auth.js requirements; deploy report-only before enforcement. Add HSTS only on verified HTTPS production.  
**CHANGE REQUIRED:** YES

### 19. Force HTTPS

**STATUS:** PARTIAL  
**EVIDENCE:** Cloudinary API and returned `secure_url` use HTTPS. Metadata fallback is HTTPS. Auth.js derives Secure cookie behavior from HTTPS. Repository has no redirect/HSTS configuration; Vercel project settings were not queried.  
**FILES / ROUTES:** `app/api/upload/route.ts`, `app/layout.tsx`, `lib/seo.ts`, `next.config.ts`.  
**CURRENT BEHAVIOR:** Expected Vercel deployment should enforce HTTPS, but this is a deployment assumption.  
**RISK:** Alternate hosting/custom-domain misconfiguration could allow HTTP.  
**RECOMMENDATION:** Verify live domain redirect and certificate behavior, canonical URLs, and absence of mixed content. Then add production HSTS.  
**CHANGE REQUIRED:** YES at deployment verification level.

### 20. Scan dependencies

**STATUS:** FAIL  
**EVIDENCE:** Full `npm audit` reported 2 critical, 8 high, and 5 moderate findings. Production-only scan reported 2 critical, 6 high, and 5 moderate. Installed sensitive versions include Next.js 16.2.6, next-auth 5.0.0-beta.31, @auth/core 0.41.2, nodemailer 7.0.13, Prisma 7.8.0, and sharp 0.34.5. Fixes are reported available, including Next.js 16.3.1 and newer Auth.js core; Nodemailer remediation is a major upgrade.  
**FILES / ROUTES:** `package.json`, `package-lock.json`, installed dependency tree.  
**CURRENT BEHAVIOR:** Known vulnerable versions are installed. Some advisories are tooling- or feature-specific, but Auth.js and Nodemailer are runtime paths.  
**RISK:** Authentication validation/availability issues, mail-library weaknesses, image-processing vulnerabilities, and build-tool issues.  
**RECOMMENDATION:** Upgrade in small isolated batches; do not use blind `npm audit fix --force`. Retest authentication, CSRF, contact email, image optimization, Prisma migrations, build, and CMS flows.  
**CHANGE REQUIRED:** YES

## Critical findings

1. **Tracked live configuration and confirmed history exposure.** `.env.local` contains populated sensitive configuration and is present across repository history. Rotate `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, and any SMTP/Cloudinary/service credentials that have ever been present; review public keys for associated policy/abuse exposure.
2. **Critical authentication dependency advisories.** `@auth/core@0.41.2` is within ranges flagged by `npm audit`; update next-auth/Auth.js to a compatible fixed release. The homoglyph-email advisory may have reduced exploitability because this application uses a Credentials provider and exact comparisons, but a critical auth dependency should not remain unpatched.

## High-risk findings

- Public project list/detail APIs do not restrict unpublished projects and return complete child content.
- No login rate limit exists for the public admin credentials endpoint.
- Production dependency audit includes high findings in Nodemailer, Next.js transitive PostCSS/sharp, Auth.js, and URI-related packages. Applicability varies, but updates are available.
- The plaintext environment credential fallback creates a second admin authentication path and its value is part of the confirmed repository exposure.

## Medium-risk findings

- Contact notification HTML interpolates unescaped user content.
- Security headers and CSP are absent.
- Several CMS mutation routes lack strict bounded validation and URL scheme allowlists.
- Public settings response includes the configured contact email and raw project APIs over-return data.
- In-memory contact throttling is not shared across serverless instances.
- Some API catches return `String(error)`, potentially exposing database/internal details.
- Admin route guarding is inconsistent; client-only CMS pages render to unauthenticated visitors even though mutations fail.

## Low-risk findings

- Route IDs are unconstrained strings, though Prisma uses exact structured queries.
- Slugs have no canonical pattern/reserved-name validation.
- Generic upload endpoint does not enforce caller purpose.
- Orphaned Cloudinary resources may accumulate because DB detachment is not remote deletion.
- Thirty-day default admin JWT lifetime may be longer than necessary.

## Not applicable

- Direct browser database keys/access: the application uses server-side Prisma only.
- PostgreSQL RLS is not required for a single-owner CMS if server-side authorization is complete. The present gap is application authorization, not missing database RLS.
- Sanitizing ordinary React text is unnecessary; React already escapes it.

## Already well-hardened

- Server-side Prisma with no raw SQL.
- Bcrypt cost 12 for seeded database credentials.
- Fail-closed behavior when both environment fallback credentials are not configured.
- Authentication on all inspected mutation endpoints.
- Project-scoped child update/delete for case-study sections and project images.
- Contact form Zod bounds, request size bound, honeypot, duplicate suppression, and generic public errors.
- Upload authentication, size/MIME/extension/magic-byte validation, random identifiers, server-side signing, and HTTPS Cloudinary URL.
- Published-only public page queries in `lib/portfolio-content.ts`.
- Plain React rendering for CMS text rather than unsanitized HTML.
- Explicit select fields on the authenticated media library.

## Portfolio-specific review

### A. Admin attack surface

Entry points:

- Login: `/admin/login`, `/api/auth/[...nextauth]`.
- UI: `/admin`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]/edit`, `/admin/content`, `/admin/resume`, `/admin/settings`, `/admin/skills`, `/admin/testimonials`.
- Writes: project, project image, case-study section, content, settings, hero slides, social links, resume, experiences, skills, services, testimonials, and upload API routes.

Mutation protection is present server-side. Central route protection and admin-only read separation are incomplete. Authorization checks only require `session.user`; they do not enforce `role === "admin"`. In the current single-admin model every legitimate user is admin, but explicit role checks would prevent future privilege drift.

### B. Contact form

- PASS: server validation, length bounds, body-size bound, honeypot, IP rate limit, duplicate suppression, database parameterization, generic public errors.
- PARTIAL: limiter is local-memory only.
- FAIL: notification HTML does not escape user fields. Header values are passed through Nodemailer, which normally protects header construction, but input should still reject CR/LF in name/subject and email HTML should be escaped.

### C. Cloudinary

- PASS: API secret and signing remain server-side; random public IDs; type/size/signature checks; HTTPS upload and secure returned URL; authentication required.
- PARTIAL: a generic endpoint permits both PDF and image uploads; no purpose binding, image dimension limit, or authenticated Cloudinary deletion workflow.
- Arbitrary deletion is not currently possible because no Cloudinary delete endpoint exists.

### D. CMS content

Typed block enum and payload normalization are valuable. However, nested payload fields need length bounds, media URLs need scheme/host policy, site-content JSON needs key-specific schemas, and external CTA/social/project URLs need `https:` allowlists. Public text rendering is escaped.

### E. Redirects

Project toggle/delete redirects use a constant `/admin/projects` path resolved against the request URL. Auth.js default redirect callback permits relative URLs and same-origin absolute URLs only. No custom `returnTo` flow was found. Open-redirect risk is currently low.

### F. Slugs and route params

Public page lookup uses Prisma exact equality plus `published: true`, which prevents path traversal at the DB layer. `projectSchema` only requires two characters; it should enforce lowercase URL-safe slugs, a maximum length, and reserved route exclusions. Admin ID routes should validate CUID-like format primarily for predictable errors, not SQL safety.

### G. Logging

No code logs passwords, session tokens, Auth secrets, Cloudinary secrets, or `DATABASE_URL`. Upload logs only an error message. Contact email failure currently logs the error object, which can include SMTP operational details; seed failure logs the full error. Production logging should redact connection/recipient details and avoid raw contact content.

### H. Error handling

Most public endpoints return generic messages. Resume-experience handlers return `String(error)` and can disclose Prisma/database details. Standardize server-side correlation logging plus generic client responses. Disable detailed production framework error exposure through normal Next.js production deployment.

### I. Security headers and CSP compatibility

No headers were changed. Before enforcement, test homepage, work list/detail, contact submission, login/sign-out, every admin editor, Cloudinary image delivery/upload, PDF resume, local fonts, Next.js image optimization, and hydration. CSP should begin in Report-Only and account for self-hosted Next.js assets, inline framework requirements/nonces, `res.cloudinary.com`, `images.unsplash.com`, Cloudinary API calls from the server only, and any analytics actually enabled.

## Quick wins

1. Rotate exposed credentials and stop tracking `.env.local`.
2. Patch Auth.js and Next.js in isolated dependency updates.
3. Require auth on admin project detail/list APIs and enforce `published: true` on public DTOs.
4. Remove contact email from the public settings API unless deliberate.
5. Escape notification email HTML and remove raw error strings from responses.
6. Add strict schemas to settings/social/resume/skills/services/testimonials/slides.
7. Add a basic tested header set before CSP enforcement.

## Architectural changes

- Separate public read models from authenticated admin read models.
- Centralize authorization helpers (`requireAdmin`) while retaining handler checks.
- Introduce key-specific `SiteContent` schemas without reducing CMS editability.
- Add an upload-purpose contract rather than separate arbitrary upload logic in clients.
- Consider a shared rate-limit backend only if Vercel instance distribution makes the local limiter ineffective.

## Deployment-level controls

- Verify Vercel HTTPS redirect, custom-domain certificate, HSTS readiness, environment scoping, preview environment secrets, deployment/log access, WAF/rate-limit options, and Git integration access.
- Verify PostgreSQL TLS, encryption at rest, backup encryption/retention, IP/network policy, least-privilege role, and audit logs.
- Verify Cloudinary signed upload policy, access controls, backup/retention, allowed formats, and transformation limits.
- Enable repository secret scanning, push protection, Dependabot/Renovate, and protected-branch checks.

## Credentials requiring rotation

Treat the following classes as exposed if they are or ever were populated in tracked `.env.local`:

- PostgreSQL/database credentials and connection URL.
- Auth.js secret.
- Admin environment-fallback password and associated email credential.
- SMTP credentials, if present in any historical version.
- Cloudinary API key/secret, if present in any historical version.
- Contact/service credentials and any third-party tokens in historical versions.
- Review public publishable keys for abuse and rotate if provider policy or associated access rules warrant it.

Rotation must happen before history cleanup. This report intentionally does not include values.

## Dependency findings

| Severity | Packages / paths | Practical note | Smallest safe remediation |
|---|---|---|---|
| CRITICAL | `next-auth` / `@auth/core` | Runtime authentication path; installed core is below the reported fixed range. | Upgrade Auth.js/next-auth to a release resolving fixed `@auth/core`; execute full login/session/CSRF regression tests. |
| HIGH | `nodemailer` | Runtime contact-notification path; several advisories are feature-specific, but installed major is affected by audit ranges. | Upgrade to a fixed Nodemailer release in an isolated change and test SMTP transport/content. |
| HIGH | `next` transitive `sharp` and `postcss` | Sharp is used by Next image optimization; PostCSS is primarily build-time. | Upgrade Next.js to the reported compatible fixed patch/minor and validate images/build. |
| HIGH | `fast-uri`, `brace-expansion` | Transitive; exploitability depends on callers and is partly tooling-oriented. | Refresh lockfile through compatible parent upgrades; avoid direct overrides unless tested. |
| MEDIUM | Prisma dev chain (`@prisma/dev`, Hono, Valibot) | Primarily CLI/development path but present in the dependency graph. | Upgrade Prisma within compatible release and verify generation/migrations/build. |

Do not run `npm audit fix --force`; it may introduce unreviewed major changes.

## Post-hardening re-score

Verification date: 2026-08-15

| Control | Before | After | Evidence |
|---|---|---|---|
| 1. Hide API keys | FAIL | PARTIAL | `.env.local` is removed from the index, ignored, preserved locally, and absent from client bundles for database/Auth/password values. Rotation and the containment commit remain outstanding. |
| 2. Purge Git secrets | FAIL | FAIL | Seven historical commits and two remote branches still contain `.env.local`. History rewrite was correctly not performed; rotate first, then obtain separate approval. |
| 3. Safe public database keys only | NOT APPLICABLE | NOT APPLICABLE | Prisma uses server-only `DATABASE_URL`; no browser database client is present. Review/remove unused public Supabase configuration. |
| 4. Row/record-level security | PARTIAL | PASS | Anonymous project list/detail database queries now include `published: true`; authenticated admin reads retain drafts; child mutations remain project-scoped. |
| 5. Encrypt sensitive data | UNKNOWN | UNKNOWN | Provider encryption, backup, retention, and network controls remain deployment/provider evidence, not repository evidence. |
| 6. Enforce server-side auth | PARTIAL | PASS | `proxy.ts` protects `/admin/:path*`; mutation APIs and admin media/contact reads enforce server-side sessions. Anonymous runtime probes returned redirects/401. |
| 7. Lock record access | FAIL | PASS | Anonymous list/detail reads are publication-scoped and draft detail returns the same not-found boundary; media/section mutations retain parent scoping. |
| 8. Block field tampering | PARTIAL | PARTIAL | Project and case-study paths whitelist/validate fields, but several older CMS endpoints still need stricter per-resource schemas. |
| 9. Secure session cookies | PASS | PASS | Auth.js upgraded to beta.32/@auth core 0.41.3; successful login, session retrieval, logout, protected route, CSRF flow, and production build were exercised. |
| 10. Hash passwords | PARTIAL | PASS | Database passwords remain bcrypt-hashed, missing-user comparison uses a dummy bcrypt hash, and runtime authentication is now database-only. `ADMIN_PASSWORD` is limited to explicit seed/password-rotation tooling. |
| 11. Rate limit login | FAIL | PASS | Server-side IP + hashed normalized identifier limiter permits five failures per 15 minutes, then applies a 15-minute cooldown with no permanent lockout; success clears failures. Boundary test passed. |
| 12. Bot protection | PARTIAL | PARTIAL | Contact honeypot/rate/duplicate controls remain; login throttling is added. In-memory limits are intentionally proportional but instance-local. |
| 13. Parameterize DB queries | PASS | PASS | Prisma query APIs remain in use; no unsafe raw SQL was introduced. |
| 14. Validate all input | PARTIAL | PARTIAL | Existing Zod and upload validation is preserved; legacy settings/social/content schemas still require a separate hardening pass. |
| 15. Escape/sanitize user content | PARTIAL | PARTIAL | React text escaping remains; notification HTML and stored external URL policies still need targeted remediation. |
| 16. Restrict file uploads | PARTIAL | PARTIAL | Authentication, size/type/signature checks, random naming, and server signing remain; purpose-specific upload contracts and safe provider deletion remain future work. |
| 17. Trim API responses | FAIL | PARTIAL | Draft project/case-study data is no longer anonymously returned. Public settings/contact-field minimization remains incomplete. |
| 18. Security headers | FAIL | PASS | Tested production responses include CSP, `nosniff`, strict referrer policy, permissions policy, frame denial, and HSTS. Development alone permits `unsafe-eval`; production does not. |
| 19. Force HTTPS | PARTIAL | PARTIAL | HSTS is present and application assets use HTTPS, but the live Vercel custom-domain redirect/certificate still requires owner/deployment verification. |
| 20. Scan dependencies | FAIL | PASS | Full `npm audit` reports 0 critical, 0 high, 0 moderate, 0 low. Prisma generation, TypeScript, ESLint, and Next.js 16.3.1 production build pass. |

## Remaining risk by severity

- **CRITICAL:** active credentials exposed in Git history may remain valid. This is the only release-blocking critical risk and requires owner rotation/revocation.
- **HIGH:** none in the current dependency audit; no anonymous draft-project boundary remains in code.
- **MEDIUM:** provider encryption/retention evidence, public settings response minimization, legacy CMS endpoint schemas, notification-email escaping, and distributed rate-limit durability.
- **LOW:** CSP still permits inline script/style for current Next.js compatibility; HSTS/custom-domain behavior needs live deployment confirmation; unused public Supabase variables should be removed after confirming they are not deployment dependencies.

## Verification record

- `git ls-files '.env*'`: only `.env.example`.
- Client bundle scan: no `DATABASE_URL`, `AUTH_SECRET`, or `ADMIN_PASSWORD` values; the admin email equals the intentionally public contact email in the current local configuration.
- Anonymous runtime probes: `/admin` redirects; contact/media reads and CMS mutations return 401; upload GET is not exposed and anonymous upload POST returns 401.
- Auth runtime: credentials login creates an admin session; session endpoint returns the role; sign-out clears the session.
- Database-only auth: the rotated database password succeeds; incorrect, historical, and nonexistent-user credentials fail; a database-unavailable test fails closed with no environment bypass.
- Production database-only cutover (2026-08-16): `ADMIN_PASSWORD` and `ADMIN_EMAIL` were removed from the Vercel Production and Preview runtime environments. `DATABASE_URL` and `AUTH_SECRET` were retained unchanged. Production deployment `dpl_7RTdd3Hq1g4nNHCMRKggQsajzWUD` completed successfully from commit `d298318e7ec5c8cf63fcedfb1e58e25153470ee5` and received the `meed-portfolio.vercel.app` alias.
- Post-cutover production verification: the current database password authenticated with the admin role; the historical password did not authenticate; logout cleared the session; anonymous `/admin` returned a redirect; anonymous project and settings administration requests returned 401. The public contact submission endpoint remains intentionally anonymous and returned input validation rather than an authentication response.
- Login limiter: initial request allowed, fifth recorded failure triggers cooldown, time-window expiry restores access, and clear restores access.
- Public pages and header probes: homepage, Work, About, Resume, and Contact return 200 with the configured security header set.
- Database-backed CRUD, draft data fixtures, contact-message retrieval, SMTP delivery, Cloudinary upload/removal, and session-expiry timing could not be fully exercised because they require reachable provider state and/or deliberate test records. These are required post-rotation staging checks, not claimed as passed.

## Release gate

**DATABASE-ONLY PRODUCTION AUTHENTICATION COMPLETE**

Local and production rotation of `DATABASE_URL`, `AUTH_SECRET`, and `ADMIN_PASSWORD` is confirmed complete. The Supabase PostgreSQL admin user's bcrypt hash was updated through a password-only Prisma transaction on 2026-08-15. Independent verification confirmed exactly one matching admin, the new password matches, the historical password does not match, and the normal Auth.js flow accepts the new password and rejects the historical password. The runtime environment credential fallback has now been removed from source and authentication fails closed when the database is unavailable.

Database counts before and after rotation were unchanged: 1 user, 3 projects, 4 case-study sections, 5 site-content records, and 3 project images. No project, case-study, site-content, media, or unrelated user record was modified.

The database-only authentication change was committed, merged to `master`, and deployed to production. After the initial production verification passed, `ADMIN_PASSWORD` and the maintenance-only `ADMIN_EMAIL` were removed from Vercel runtime variables and production was redeployed. The post-removal verification passed: the current database credential authenticates, the historical credential fails, logout clears the session, anonymous admin navigation redirects, and protected admin APIs return 401. Runtime authentication is fully database-only in production; there is no environment credential bypass.

`DATABASE_URL` and `AUTH_SECRET` remain required production secrets and were not removed or modified during this cutover. `ADMIN_EMAIL` and `ADMIN_PASSWORD` remain valid only as explicitly supplied inputs for local maintenance/seed/password-rotation tooling; they are not deployed application runtime requirements. Git history cleanup and any non-authentication findings elsewhere in this audit remain separately tracked and approval-gated.
