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

The Nodemailer 9 peer warning is a documented compatibility exception: Auth.js beta.32 declares Nodemailer 7/8 only as an optional peer, while this application does not configure the Auth.js Nodemailer provider. The contact route imports Nodemailer directly. Re-test actual SMTP transport in staging after credentials are configured; if transport compatibility fails, use the latest fixed v8 release supported by the deployed mail provider rather than weakening the audit result silently.

## Addendum 2026-08-18 — deepmerge-ts advisory (dev-only, tracked)

`npm audit` reports **3 high** findings via `deepmerge-ts@7.1.5` (`GHSA-ggr8-5vv4-36mx`, stack exhaustion) reached
through `prisma@7.9.1` → `@prisma/config@7.9.1`. `@prisma/config` pins `deepmerge-ts` exactly (`"7.1.5"`), and no
patched Prisma 7 release exists yet (fix range starts at a 7.10.0 pre-release). `npm audit fix --force` would
downgrade to `prisma@6.12.0`, a breaking change — **not applied**.

Assessment: **development/CI-only.** The chain is reachable only through the `prisma` CLI package (a devDependency,
used for migrations/studio/generation); the deployed web runtime tree is unaffected. `npm audit --omit=dev` reports
**0 vulnerabilities**.

Follow-up: remove when Prisma publishes a patched 7.x release (`>=7.10.0` or equivalent), or revisit a narrow
`deepmerge-ts` override only if verified against the pinned `@prisma/config` API. Do not run `npm audit fix --force`.
