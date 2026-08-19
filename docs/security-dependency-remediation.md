# Security Dependency Remediation

Date: 2026-08-15

The approved remediation used compatible package updates and narrow transitive overrides. `npm audit fix --force` was not used.

| Package / path | Previous version | Vulnerability class | Severity | Direct / transitive | Fix available | Secure target | Breaking-change risk | Action |
|---|---:|---|---|---|---|---:|---|---|
| `next-auth` → `@auth/core` | beta.31 → 0.41.2 | Auth.js advisory set reported by npm | CRITICAL | Direct → transitive runtime | Yes | beta.32 → 0.41.3 | Low beta patch; auth-sensitive | Updated and verified login/session/logout/CSRF/protected routes/build. |
| `next` | 16.2.6 | Next runtime/transitive image and build advisories | HIGH | Direct runtime | Yes | 16.3.1 | Low minor; Next 16 guide reviewed | Updated; typecheck, lint, build, pages, images/header smoke checks passed. |
| `nodemailer` | 7.0.13 | Mail parsing/transport advisory set | HIGH | Direct runtime | Yes | 9.0.5 | Medium major; Auth.js optional peer range does not yet list v9 | Updated because application uses only `createTransport`/`sendMail`, not Auth.js email provider. Build/type checks pass; live SMTP delivery remains a staging check. |
| `@prisma/client`, adapter, CLI | 7.8.x | Prisma development/transitive advisory set | MEDIUM | Direct and transitive | Yes | 7.9.1 | Low patch/minor | Updated; Prisma generation and production build pass. No migration was run. |
| `brace-expansion` via ESLint/TypeScript ESLint | 1.1.15 / 5.0.6 | Regular-expression denial of service | HIGH | Transitive development | Yes | 1.1.18 / 5.0.9 | Low patch override | Narrow vulnerable-range overrides; ESLint and build pass. |
| `js-yaml` via `@eslint/eslintrc` | 4.2.0 | Prototype pollution | HIGH | Transitive development | Yes | 4.3.1 | Low patch override | Narrow vulnerable-range override; ESLint and build pass. |

## Final audit result

`npm audit` reports **0 total vulnerabilities**: 0 critical, 0 high, 0 moderate, and 0 low across production and development dependencies.

The Nodemailer 9 peer warning was a documented compatibility exception: Auth.js beta.32 declares Nodemailer 7/8 only as an optional peer, while this application does not configure the Auth.js Nodemailer provider. The contact route imported Nodemailer directly. Resolved on 2026-08-19 by removing nodemailer and switching to the Resend HTTP API — see Addendum 2026-08-19.

## Addendum 2026-08-18 — deepmerge-ts advisory (dev-only, tracked)

`npm audit` reports **3 high** findings via `deepmerge-ts@7.1.5` (`GHSA-ggr8-5vv4-36mx`, stack exhaustion) reached
through `prisma@7.9.1` → `@prisma/config@7.9.1`. `@prisma/config` pins `deepmerge-ts` exactly (`"7.1.5"`), and no
patched Prisma 7 release exists yet (fix range starts at a 7.10.0 pre-release). `npm audit fix --force` would
downgrade to `prisma@6.12.0`, a breaking change — **not applied**.

Assessment: **development/CI-only.** The chain is reachable only through the `prisma` CLI package (a devDependency,
used for migrations/studio/generation); the deployed web runtime tree is unaffected. Note on audit semantics under
npm 11: `@prisma/client@7.9.1` declares `prisma` as an **optional peer**, so npm marks the root devDependency
`devOptional`, and `npm audit --omit=dev` alone now includes it (3 high). The production-only query is
`npm audit --omit=dev --omit=optional`, which reports **0 vulnerabilities**.

Follow-up: remove when Prisma publishes a patched 7.x release (`>=7.10.0` or equivalent), or revisit a narrow
`deepmerge-ts` override only if verified against the pinned `@prisma/config` API. Do not run `npm audit fix --force`.

## Addendum 2026-08-19 — nodemailer removed; contact email switched to Resend HTTP API

`nodemailer@9.0.5` and `@types/nodemailer` were **removed** from `package.json` and `package-lock.json`. Contact-form
email is now sent through the **Resend HTTP API** using the platform `fetch` in `lib/email.ts` — no new runtime
dependency and no SMTP credentials in the application.

Reason: Vercel Preview builds failed with `ERESOLVE` — `@auth/core@0.41.3` (used by `next-auth@5.0.0-beta.32`)
declares an optional peer of `nodemailer ^7.0.7 || ^8.0.5`, conflicting with the installed `nodemailer@9.0.5`. No
release of `@auth/core` (through 0.41.3) or `next-auth` (through beta.32) accepts nodemailer 9, and no secure 8.x
exists: `GHSA-p6gq-j5cr-w38f` (HIGH; arbitrary file read / SSRF via `message.raw`) is fixed only in `>=9.0.1`, so
every nodemailer version inside the Auth.js peer range is vulnerable. The application used only
`createTransport`/`sendMail(html)` (never `raw`), so the advisory was not reachable in practice.

Owner-approved decision ("replace email transport"): do not suppress the conflict with
`--force`/`--legacy-peer-deps`/overrides.
- `lib/email.ts` POSTs to `https://api.resend.com/emails` with a `Bearer` token from `RESEND_API_KEY`; it no-ops
  (logs a warning) when the key is unset and throws on non-2xx responses. The contact route keeps its non-fatal
  `.catch(...)`. No UI changed.
- `.env.example` documents `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (placeholder `onboarding@resend.dev`).
- `ARCHITECTURE.md` email line updated.

Verification: clean `npm install` exits 0 with no `ERESOLVE`; `npm ls nodemailer` is empty; Prisma generate,
`tsc --noEmit`, ESLint, tests 21/21, and the production build all pass. Full `npm audit` remains 3 high dev-only
(see Addendum 2026-08-18); `npm audit --omit=dev --omit=optional` reports **0**.

Follow-up (owner): add `RESEND_API_KEY` to Vercel environment variables, verify `RESEND_FROM_EMAIL`, and send a live
contact-form message from the new Preview to confirm delivery.
