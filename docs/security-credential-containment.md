# Security Credential Containment Record

Date: 2026-08-15

No credential values are included in this document.

## Redacted inventory

Because `.env.local` was committed, every populated credential in it is treated as exposed regardless of repository visibility.

| Secret type | Environment variable name | Service | Rotation required |
|---|---|---|---|
| Database connection credential | `DATABASE_URL` | PostgreSQL database provider | YES |
| Session/JWT encryption secret | `AUTH_SECRET` | Auth.js | YES |
| Admin login identifier | `ADMIN_EMAIL` | MEED CMS credentials | Review/change together with admin password |
| Admin login password | `ADMIN_PASSWORD` | MEED CMS credentials | YES |
| Contact destination address | `CONTACT_EMAIL` | Portfolio contact workflow | NO — privacy review only; not an authentication secret |
| Public project URL | `NEXT_PUBLIC_SITE_URL` | Portfolio deployment | NO |
| Public service URL | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project identifier | NO — remove if unused |
| Publishable client key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public API identity | Conditional — designed to be public, but review database policies and rotate if provider policy or abuse evidence warrants it |
| Local Auth.js URL | `AUTH_URL` | Auth.js development configuration | NO |
| Cloudinary API secret/key | `CLOUDINARY_API_SECRET`, `CLOUDINARY_API_KEY` | Cloudinary | NOT PRESENT in the inspected tracked `.env.local` history; rotate if configured in any other repository/deployment artifact |
| SMTP password/user | `SMTP_PASS`, `SMTP_USER` | Email provider | NOT PRESENT in the inspected tracked `.env.local` history; rotate if configured in any other repository/deployment artifact |

## Containment completed locally

- `.env.local` has been removed from the Git index with `git rm --cached`; the developer's usable local file remains on disk.
- `.gitignore` covers `.env`, `.env.local`, and `.env.*.local`, while explicitly retaining `.env.example`.
- `git ls-files '.env*'` now reports only `.env.example`.
- `.env.example` contains placeholders rather than live values.

The staged deletion must be committed and pushed before remote current-source containment is complete.

## Git history facts

- Repository: `themeed9/Meed-Portfolio`.
- GitHub visibility at inspection time: **PRIVATE**.
- Local branches affected: `master`, `agent/portfolio-redesign`.
- Remote-tracking branches affected: `origin/master`, `origin/agent/portfolio-redesign`.
- Tags affected: none; no tags exist.
- Remote history contains `.env.local`: **YES**, confirmed from both remote-tracking branch refs.
- Historical commits containing the path include: `f4754bdc`, `c429ba89`, `25040a08`, `b8fbeae9`, `50b4bc4c`, `e53bc3b6`, and `1e318b71`.

No history rewrite was performed. That remains separately approval-gated.

## Owner rotation checklist

Complete rotation in this order. Do not place new values in chat, source files, issues, pull requests, or documentation.

1. **PostgreSQL/database provider**
   - Rotate/reset the database password or create a new least-privilege application credential.
   - Update `DATABASE_URL` in Vercel Production, Preview, and Development scopes as appropriate.
   - Update the preserved local `.env.local`.
   - Redeploy and verify Prisma connectivity and CMS reads/writes.
   - Revoke the old database credential and confirm it no longer connects.

2. **Auth.js**
   - Generate a new cryptographically random `AUTH_SECRET` through an approved local/provider mechanism.
   - Update Vercel and local configuration.
   - Expect all existing sessions to become invalid.
   - Verify login, session retrieval, protected routes, and logout.

3. **Admin environment credential**
   - Replace `ADMIN_PASSWORD` with a unique high-entropy value and review/change `ADMIN_EMAIL` if appropriate.
   - Update Vercel and local configuration.
   - Runtime environment fallback removal completed after database-backed authentication was verified. These variables now remain only for explicit maintenance/seed tooling.
   - Confirm the old password fails.

4. **Supabase public configuration**
   - Confirm the public URL/key are unused by the current server-side Prisma architecture.
   - Review Supabase database/API policies even though the publishable key is designed for browser exposure.
   - Remove unused variables from Vercel/local configuration; rotate the publishable key only if provider guidance or policy exposure justifies it.

5. **SMTP, Cloudinary, and other providers**
   - Review GitHub Actions, Vercel environment history, PR artifacts, local backups, and earlier unreferenced files for credentials not present in inspected `.env.local` commits.
   - If any were ever committed or shared, rotate them in their provider consoles, update Vercel/local configuration, test, and revoke the old values.

6. **Contact address**
   - `CONTACT_EMAIL` is personal/configuration data rather than an authentication secret. Change it only if privacy exposure is unacceptable.

## History-removal procedure after rotation

Credential rotation has priority. Once rotation is complete and separate approval is granted:

1. Freeze merges and notify collaborators.
2. Create a protected backup mirror accessible only to the owner for recovery.
3. Use `git filter-repo --path .env.local --invert-paths` across all refs.
4. Re-scan all rewritten refs with GitHub secret scanning and an independent secret scanner.
5. Force-push the coordinated rewritten branches and remove obsolete remote refs.
6. Close/recreate affected pull requests if required.
7. Ask every collaborator and deployment worker to delete old clones/caches and re-clone.
8. Confirm the old credentials remain revoked even after cleanup.

History removal reduces accidental rediscovery; it does not replace rotation.

## Release gate

**BLOCKED — OWNER ACTION REQUIRED**

Deployment remains blocked until the owner completes credential rotation and verifies old credentials are revoked. Removing `.env.local` from tracking alone does not make exposed credentials safe.
