# MEED Portfolio Security Hardening Plan

This plan follows the audit in `docs/security-audit.md`. It proposes changes only; none have been implemented. Every change requires review under the approval gate.

## P0 — immediate

### P0.1 Contain and rotate repository-exposed credentials

- **Exact files/systems:** `.env.local`, `.gitignore`, GitHub repository/history, Vercel environment variables, PostgreSQL provider, Auth.js configuration, SMTP provider, Cloudinary, any third-party service represented historically.
- **Reason:** A populated environment file is tracked and exists across multiple commits.
- **Security risk:** Repository readers can authenticate as admin, access the database, forge sessions, or use third-party services depending on exposed values.
- **Smallest safe change:** Inventory historical variable names without printing values; rotate database credentials, Auth secret, admin fallback password, SMTP/Cloudinary secrets as applicable; update Vercel; verify; then remove `.env.local` from tracking and ignore `.env*` except `.env.example`.
- **Expected behavior change:** Existing Auth.js sessions are invalidated when `AUTH_SECRET` rotates; services reconnect using new credentials. Public behavior otherwise remains unchanged.
- **Regression risk:** High if rotation order is wrong; database/auth/email/uploads can temporarily fail.
- **Verification method:** New credentials succeed in preview; old credentials fail; login, DB reads/writes, contact email, and uploads pass; `git ls-files .env.local` returns nothing.

### P0.2 Clean Git history after rotation

- **Exact files/systems:** all Git commits containing `.env.local`, GitHub branches/tags/PR refs, collaborator clones, CI caches.
- **Reason:** Normal deletion does not remove historical copies.
- **Security risk:** Rotated or overlooked credentials remain retrievable; unrotated historical values remain active.
- **Smallest safe change:** After rotation and explicit approval, use `git filter-repo` or equivalent to remove `.env.local` from all refs, coordinate force-push, expire caches where supported, and require re-clone.
- **Expected behavior change:** Commit hashes change; open branches/PRs may need recreation.
- **Regression risk:** High collaboration/disruption risk; no runtime behavior change.
- **Verification method:** Search all refs for the path and secret patterns using a scanner; GitHub secret scanning shows no active findings; collaborators confirm fresh clones.

### P0.3 Patch authentication vulnerabilities

- **Exact files:** `package.json`, `package-lock.json`, `lib/auth.ts`, auth regression tests.
- **Reason:** `npm audit` reports critical/high vulnerabilities through `next-auth@5.0.0-beta.31` and `@auth/core@0.41.2`.
- **Security risk:** Authentication normalization/availability/security-check weaknesses in a public admin login path.
- **Smallest safe change:** Upgrade next-auth/Auth.js to the smallest compatible version resolving fixed `@auth/core`; do not combine with auth redesign.
- **Expected behavior change:** Ideally none; cookies/internal callback behavior may change between beta releases.
- **Regression risk:** Medium-high because the project uses a beta major.
- **Verification method:** Test valid/invalid credentials, Unicode email edge cases, CSRF rejection, session persistence/expiry, logout, protected routes, Secure/HttpOnly/SameSite cookies, and malformed Authorization headers.

### P0.4 Close unpublished project read exposure

- **Exact files:** `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`, `app/admin/projects/[id]/edit/page.tsx`, potentially a new authenticated admin project-read route/helper.
- **Reason:** Public APIs return unrestricted project rows, IDs, images, and case-study sections.
- **Security risk:** Unauthenticated users can enumerate or retrieve draft/unpublished content.
- **Smallest safe change:** Require admin auth on the existing ID-based admin read. Either make the list auth-only or return a strict published public DTO. Keep public pages using `getPublishedProjects/getPublishedProject`.
- **Expected behavior change:** Unauthenticated API callers no longer see drafts; public portfolio pages remain unchanged.
- **Regression risk:** Medium because admin editor fetch paths depend on the current endpoint.
- **Verification method:** Anonymous list/detail cannot return unpublished data; authenticated editor still loads; published homepage/work/detail pages render; 404/401 behavior is consistent.

## P1 — before production deployment

### P1.1 Add centralized admin route protection and explicit admin authorization

- **Exact files:** `app/admin/layout.tsx` and/or Next.js 16-compatible `proxy.ts`; `lib/auth.ts`; a new `lib/require-admin.ts`; all protected API routes.
- **Reason:** Some admin pages return 200 unauthenticated, and handlers check only `session.user` rather than role.
- **Security risk:** Inconsistent protection and future privilege drift.
- **Smallest safe change:** Redirect every `/admin/**` route except `/admin/login`; create `requireAdmin()` enforcing `session.user.role === "admin"`; retain handler-level checks.
- **Expected behavior change:** Anonymous CMS URLs consistently redirect; non-admin authenticated users receive 403.
- **Regression risk:** Medium; careless matching can loop the login route or block Auth.js callbacks.
- **Verification method:** Matrix-test every admin page/API as anonymous, admin, expired-session, and non-admin fixture; confirm no redirect loop.

### P1.2 Add login throttling

- **Exact files:** `lib/auth.ts`, `lib/rate-limit.ts` or a new login limiter; optional Vercel Firewall configuration.
- **Reason:** Credentials login has no attempt control.
- **Security risk:** Password guessing and credential stuffing.
- **Smallest safe change:** IP + normalized-email buckets, conservative attempt threshold, exponential cooldown, generic error, and successful-login reset. Start simple; use shared storage only if required by production topology.
- **Expected behavior change:** Repeated failures receive temporary throttling; legitimate occasional failures remain usable.
- **Regression risk:** Medium; proxies/NAT can cause false positives and in-memory limits are instance-local.
- **Verification method:** Test threshold, cooldown, Retry-After behavior where applicable, success reset, IPv4/IPv6/proxy parsing, and multi-instance expectations.

### P1.3 Strict mutation schemas and URL/slug policy

- **Exact files:** `lib/validations.ts`, `lib/case-study.ts`, settings/slides/social/resume/skills/services/testimonials/content/media API routes.
- **Reason:** Validation is inconsistent and several routes trust arbitrary body fields/JSON.
- **Security risk:** Stored unsafe links, malformed CMS records, oversized payloads, and field tampering.
- **Smallest safe change:** Add `.strict()` Zod schemas with field limits; validate `https:` and intentional internal relative links; add slug max/regex/reserved-name rules; use key-specific `SiteContent` schemas while preserving an explicitly bounded extensibility path.
- **Expected behavior change:** Invalid existing or new values are rejected with 400; valid CMS workflows remain editable.
- **Regression risk:** Medium-high if existing records violate new rules.
- **Verification method:** Audit/migrate existing data first; run valid/invalid boundary tests for every route and every case-study block type; test future project publication without code changes.

### P1.4 Escape notification email content and sanitize header inputs

- **Exact files:** `lib/email.ts`, `lib/validations.ts`, contact endpoint tests.
- **Reason:** Contact fields are inserted into HTML directly.
- **Security risk:** HTML injection in administrator notification emails and potential header edge cases.
- **Smallest safe change:** HTML-escape name/email/subject/message; reject CR/LF in name/subject; optionally include a plain-text alternative; do not add a broad HTML sanitizer dependency.
- **Expected behavior change:** User markup displays as text in email.
- **Regression risk:** Low.
- **Verification method:** Submit `<img>`, `<a>`, quotes, Unicode, and CR/LF payloads; inspect raw email; confirm no added tags/headers and normal messages render correctly.

### P1.5 Trim public API responses

- **Exact files:** `app/api/settings/route.ts`, project GET routes, new public/admin DTO definitions.
- **Reason:** Public responses expose contact destination and raw record fields.
- **Security risk:** Privacy leakage and accidental future exposure as schemas grow.
- **Smallest safe change:** Separate public settings from authenticated admin settings; explicit selects/DTOs for published project reads.
- **Expected behavior change:** Public API shapes narrow; public pages continue through server data functions.
- **Regression risk:** Medium for client settings/admin consumers.
- **Verification method:** Contract tests for public/admin response fields; navbar/contact/admin settings all load; unpublished fields absent anonymously.

### P1.6 Patch remaining runtime dependency findings

- **Exact files:** `package.json`, `package-lock.json`.
- **Reason:** Production audit reports high findings in Nodemailer and Next.js transitive dependencies including sharp/PostCSS.
- **Security risk:** Runtime mail, image-processing, and framework vulnerabilities.
- **Smallest safe change:** Upgrade Next.js to the reported fixed compatible release; upgrade Nodemailer separately to a fixed release; refresh compatible transitive packages without forced major-wide rewrites.
- **Expected behavior change:** None intended; mail and image internals change.
- **Regression risk:** Medium.
- **Verification method:** Production build, typecheck, full route smoke test, responsive image rendering, Cloudinary images, SMTP notification, Auth.js flow, and repeat `npm audit --omit=dev`.

### P1.7 Add baseline security headers

- **Exact files:** `next.config.ts`; deployment configuration.
- **Reason:** Requested browser security headers are absent.
- **Security risk:** Clickjacking, MIME sniffing, referrer leakage, excessive browser capabilities.
- **Smallest safe change:** Add `X-Content-Type-Options: nosniff`, strict Referrer-Policy, minimal Permissions-Policy, and `frame-ancestors` through CSP or temporary `X-Frame-Options`. Add HSTS only after HTTPS verification.
- **Expected behavior change:** Framing and unused browser capabilities are restricted.
- **Regression risk:** Low-medium; portfolio embedding, downloads, or future integrations may be affected.
- **Verification method:** Inspect headers on all public/admin/API responses; verify login, editor, media, resume PDF, contact, and navigation.

### P1.8 Verify HTTPS and provider controls

- **Exact systems:** Vercel project/domains/environments, PostgreSQL provider, Cloudinary, GitHub.
- **Reason:** Encryption-at-rest, backups, HTTPS redirects, WAF, and environment scopes are not provable from source.
- **Security risk:** Correct application code can be undermined by deployment misconfiguration.
- **Smallest safe change:** Document evidence for HTTPS redirect/certificates, production-only secrets, preview isolation, DB TLS/encryption/backups/least privilege, Cloudinary policies, and access logs.
- **Expected behavior change:** Usually none; misconfigurations may require provider changes.
- **Regression risk:** Low to medium depending on network restrictions.
- **Verification method:** External HTTPS/redirect/header test, certificate test, least-privilege connection test, preview deployment test, provider audit-log review.

## P2 — recommended improvement

### P2.1 Purpose-bound uploads

- **Exact files:** `app/api/upload/route.ts`, `ProjectForm.tsx`, `ProjectMediaEditor.tsx`, `CaseStudySectionEditor.tsx`, `ResumeUpload.tsx`, settings page.
- **Reason:** One endpoint permits both image and PDF without knowing intended workflow.
- **Security risk:** Wrong resource type and inconsistent policy enforcement.
- **Smallest safe change:** Require validated `purpose: image | resume`; enforce image-only or PDF-only accordingly; optionally add image dimension/pixel limits.
- **Expected behavior change:** Clients include purpose; invalid type/purpose pairs return 415.
- **Regression risk:** Medium across several CMS upload callers.
- **Verification method:** Test every upload surface with valid, oversized, mismatched MIME/extension/signature, zero-byte, polyglot-like, and wrong-purpose samples.

### P2.2 Safe, reference-aware Cloudinary deletion

- **Exact files:** media/project image routes, settings/slides/resume flows, Prisma queries, Cloudinary helper.
- **Reason:** DB removal does not remove remote assets; blind remote deletion would be unsafe for reused media.
- **Security risk:** Storage accumulation; a poorly designed deletion endpoint could delete shared/arbitrary public IDs.
- **Smallest safe change:** Store owned Cloudinary public ID/resource type, count references, authenticate/authorize, and delete only unreferenced app-owned assets.
- **Expected behavior change:** Explicit deletion can reclaim unused assets; detach remains safe.
- **Regression risk:** High if reference detection is incomplete.
- **Verification method:** Reuse one asset across projects/settings, detach in stages, verify it remains until last reference, reject foreign IDs.

### P2.3 Shared production rate limiting if telemetry justifies it

- **Exact files/systems:** `lib/rate-limit.ts`, contact/login routes, Vercel Firewall or managed KV/Redis.
- **Reason:** In-memory buckets reset and are instance-local.
- **Security risk:** Distributed attackers bypass per-instance controls.
- **Smallest safe change:** Prefer platform firewall limits; otherwise a small managed atomic counter with TTL.
- **Expected behavior change:** Limits become consistent across instances.
- **Regression risk:** Medium due external dependency/failure modes.
- **Verification method:** Multi-instance concurrency tests, fail-open/fail-closed decision test, latency measurement, legitimate submission test.

### P2.4 Generic API error handling and redacted logging

- **Exact files:** resume-experience routes, contact/upload/settings/social/resume handlers, seed script, a shared response/logger helper.
- **Reason:** Some responses return `String(error)` and some logs may include operational details.
- **Security risk:** Internal path/database/SMTP detail exposure.
- **Smallest safe change:** Return generic client errors with a correlation ID; log structured error class/code only and redact sensitive fields.
- **Expected behavior change:** Clients see stable generic errors; operators use IDs for diagnosis.
- **Regression risk:** Low.
- **Verification method:** Induce DB/SMTP/Cloudinary failures in test; inspect response and logs for credentials, paths, contact body, and provider details.

### P2.5 CSP report-only rollout, then enforcement

- **Exact files/systems:** `next.config.ts` or nonce-capable request layer, Vercel response headers/reporting endpoint.
- **Reason:** CSP provides meaningful XSS containment but can break Next.js/admin/editor features if guessed.
- **Security risk:** Without CSP, any future XSS has broad script execution capability.
- **Smallest safe change:** Build policy from observed production assets; use Report-Only; eliminate violations; then enforce. Avoid `unsafe-eval` in production and minimize `unsafe-inline` with nonce/hash strategy.
- **Expected behavior change:** Initially reporting only; later unapproved scripts/frames/resources are blocked.
- **Regression risk:** High if enforced prematurely.
- **Verification method:** Full public/admin/browser matrix, Cloudinary images, local fonts, Auth.js, hydration, uploads, PDF, all responsive routes, and zero unexplained CSP reports.

### P2.6 Contact data retention and deletion

- **Exact files/systems:** `ContactMessage` model, admin contact management route/UI, provider backup policy.
- **Reason:** Personal correspondence is stored indefinitely with no reviewed retention path.
- **Security risk:** Unnecessary breach impact and privacy burden.
- **Smallest safe change:** Define retention period and authenticated delete/export behavior; schedule deletion only if operationally needed.
- **Expected behavior change:** Old messages are removed according to policy.
- **Regression risk:** Medium because deletion is irreversible.
- **Verification method:** Retention dry run, backup policy review, admin confirmation, audit logs, and recovery expectations.

## P3 — optional hardening

### P3.1 Shorter admin session and reauthentication for destructive actions

- **Exact files:** `lib/auth.ts`, destructive admin UI/API routes.
- **Reason:** Default JWT lifetime is 30 days.
- **Security risk:** Stolen unattended session remains useful longer.
- **Smallest safe change:** Set a shorter maxAge and optionally require recent authentication for project deletion/credential-sensitive settings.
- **Expected behavior change:** Admin signs in more often.
- **Regression risk:** Low technical, medium usability.
- **Verification method:** Expiry boundary, refresh, logout, and destructive-action tests.

### P3.2 CI security policy

- **Exact files/systems:** GitHub Actions, branch protection, Dependabot/Renovate, secret scanning/push protection.
- **Reason:** Current issues could recur silently.
- **Security risk:** New secrets/vulnerable dependencies merge unnoticed.
- **Smallest safe change:** Add lockfile audit thresholds with reviewed exceptions, secret scanning, dependency updates, and protected checks.
- **Expected behavior change:** Risky changes fail or require explicit review.
- **Regression risk:** Low; noisy advisories can block delivery without an exception process.
- **Verification method:** Safe synthetic secret detector test, intentionally vulnerable test branch, dependency PR, branch protection validation.

### P3.3 Explicit public URL helper

- **Exact files:** shared URL schema/helper, Hero, footer/social links, project links, resume links, media fields.
- **Reason:** CMS URLs are rendered across multiple components.
- **Security risk:** Future unsafe schemes or inconsistent external-link attributes.
- **Smallest safe change:** Centralize allowlisted internal paths and `https:` external URLs; consistently add `noopener noreferrer` for new tabs.
- **Expected behavior change:** Unsafe/malformed URLs cannot be saved or rendered.
- **Regression risk:** Low-medium for legacy records.
- **Verification method:** Test `javascript:`, `data:`, protocol-relative, malformed, internal anchor/path, HTTPS, and Cloudinary URLs.

## Approval gate

Stop here. Do not implement, rotate, rewrite history, upgrade packages, change authentication/sessions/rate limits/uploads/database behavior, or add headers/CSP until the audit and this plan are reviewed and explicit approval is given.
