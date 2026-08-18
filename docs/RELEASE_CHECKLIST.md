# Release Checklist — Meed Portfolio

Release flow: **PLAN → REVIEW → APPROVE → DEPLOY → VERIFY → OBSERVE → CLOSE**

Deploys are automatic from `master` via Vercel. Nothing is pushed or deployed without owner permission.

## PRE-DEPLOY

- [ ] Git state understood (branch, working tree, no unknown changes)
- [ ] CI green (see `.github/workflows/ci.yml`)
- [ ] Migration reviewed (additive; no destructive operation)
- [ ] Vercel environment variables verified (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, Cloudinary vars)
- [ ] `npm audit` acceptable
- [ ] Production build passes
- [ ] No secrets committed (tracked env files = `.env.example` only)

## POST-DEPLOY

- [ ] Homepage
- [ ] Work index
- [ ] Published project (case study renders blocks)
- [ ] Draft project remains private
- [ ] About
- [ ] Resume
- [ ] Contact (submission works)
- [ ] Admin login
- [ ] Logout
- [ ] CMS (create/edit/reorder project content)
- [ ] Media upload
- [ ] Protected API (401 for anonymous)
- [ ] Mobile smoke test
- [ ] Browser console (no errors)
- [ ] Security headers / CSP present
