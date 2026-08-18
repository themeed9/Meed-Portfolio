# Security Regression Contract

This contract defines the security invariants that must never regress. It is the authoritative reference for
`docs/security/` and the security layer of `AGENTS.md`.

**Rule:** A change that weakens or removes an invariant is a stop condition. Do not weaken a failing test to make it
pass — fix the cause.

Invariants are labelled `SEC-INV-###`. Each lists the current implementation and how it is verified.

## Invariants

### SEC-INV-001 — Anonymous users cannot access admin pages
Admin pages are server-rendered behind `auth()` checks; the dashboard and protected pages `redirect("/admin/login")`
when unauthenticated. Admin mutations are rejected server-side.
- Implementation: `app/admin/layout.tsx`, `app/admin/page.tsx`, and per-page checks.
- Verification: manual/integration — visit `/admin/*` without a session; expect redirect or unauthenticated shell.

### SEC-INV-002 — Anonymous users cannot mutate CMS content
Every `app/api/**` mutation handler calls `auth()` and returns `401` when unauthenticated.
- Implementation: per-handler `auth()` checks.
- Verification: integration — `POST/PATCH/DELETE` against any admin API without a session returns `401`.

### SEC-INV-003 — Unpublished projects cannot be retrieved publicly
Public reads filter `published: true`; non-admin API reads return published projects only.
- Implementation: `lib/portfolio-content.ts` (`published: true`), `app/api/projects/route.ts` (admin sees all).
- Verification: integration — a draft project's slug/ID is not exposed publicly.

### SEC-INV-004 — Authentication failures must fail closed
Login errors and unknown credentials reject; unknown emails compare against a dummy bcrypt hash to reduce timing
signal. A database/`authorize` error records a failure and rejects.
- Implementation: `lib/auth.ts` `authorize` (try/catch → `recordLoginFailure` → `null`), `DUMMY_PASSWORD_HASH`.
- Verification: unit test (`tests/security/rate-limit.test.ts` covers the throttling path) + manual login attempts.

### SEC-INV-005 — Admin runtime authentication is database-only
No environment-password runtime fallback exists. `ADMIN_EMAIL`/`ADMIN_PASSWORD` are used only by explicit
seed/password-rotation tooling (`prisma/seed.ts`, `scripts/rotate-admin-password.ts`).
- Implementation: `lib/auth.ts`, `docs/adr/ADR-002.md`.
- Verification: code review — `process.env.ADMIN_PASSWORD` must never be read in a runtime auth path.

### SEC-INV-006 — Unsupported file uploads are rejected
Uploads enforce allowed MIME types, MIME/extension agreement, magic-byte signatures, and size caps
(12 MB images / 5 MB PDFs). Empty files rejected.
- Implementation: `app/api/upload/route.ts`.
- Verification: integration — uploading disguised/oversized/unsupported files returns `415`/`413`.

### SEC-INV-007 — Contact abuse controls remain active
Contact requests are bounded (20 KB body), validated (Zod), honeypot-guarded, IP rate-limited
(5 / 15 minutes), and duplicate-suppressed (1 / minute per fingerprint).
- Implementation: `app/api/contact/route.ts`, `lib/validations.ts`, `lib/rate-limit.ts`.
- Verification: unit tests for schemas and limiters (`tests/security/validation.test.ts`,
  `tests/security/rate-limit.test.ts`).

### SEC-INV-008 — Protected APIs return authorization failures to anonymous users
Any protected API called without a session returns `401`, not `200` with partial data.
- Implementation: per-handler `auth()` checks.
- Verification: integration — anonymous requests to protected APIs return `401`.

### SEC-INV-009 — Secrets must not be committed
Environment files are gitignored except `.env.example`; `.env.local` is untracked; secret values never appear in
code, docs, or commit messages. The historical `.env.local` exposure is handled by a separate owner-controlled
history cleanup.
- Implementation: `.gitignore`, `docs/security/security-credential-containment.md`.
- Verification: `git ls-files | grep -E '\.env'` → only `.env.example`; review diffs for credential material.

### SEC-INV-010 — API responses must not expose credential material
API responses return domain data only; password hashes, tokens, and connection strings are never serialized.
- Implementation: all handlers select/return safe fields.
- Verification: code review — no `password`/secret field is returned from any route.

## Automated coverage

The automated suite (`npm test`, Node's built-in test runner, no framework added) covers the pure-logic subset that
runs without a database or running server:

- `tests/security/rate-limit.test.ts` — login throttling and contact limiters (supports SEC-INV-004, SEC-INV-007).
- `tests/security/validation.test.ts` — contact/validation bounds and honeypot rejection (SEC-INV-007).
- `tests/security/case-study.test.ts` — typed section normalization and safe fallback (content integrity).

Invariants requiring a server and/or database (SEC-INV-001, SEC-INV-002, SEC-INV-003, SEC-INV-006, SEC-INV-008) are
verified by integration/manual checks and must never be weakened. No security test targets production data.
