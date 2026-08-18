<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Meed Portfolio Agent Rules

Read `ARCHITECTURE.md` and `docs/README.md` before working. The repository contract is fixed; agents are replaceable.

## Authority Hierarchy

When sources conflict, this order wins. **Never resolve a conflict silently.**

1. Approved product direction (owner-approved phases/decisions)
2. Approved Product Owner decisions
3. Approved ADRs (`docs/adr/`)
4. `ARCHITECTURE.md` (current reality)
5. Security architecture / security invariants (`docs/security/security-regression-contract.md`)
6. This file (`AGENTS.md`)
7. Current approved phase/task specification
8. Project-local skills (`skills/`)
9. Existing implementation
10. Agent preference

If two sources materially conflict: **STOP.** Report the exact conflict, files involved, impact, options, and a recommendation. Do not silently pick one.

## Mandatory Preflight

Before modifying files, inspect:

- `git branch` and `git status`
- `git diff` and `git diff --stat`
- recent commits (`git log --oneline -20`)
- `git tag`
- canonical docs: `ARCHITECTURE.md`, `AGENTS.md`, `docs/README.md`, `docs/adr/`

## Preserve Unknown Work

Never `git reset`, `git clean`, overwrite, regenerate blindly, or discard uncommitted work without first understanding the current state. A dirty working tree may hold a human-in-progress phase. If you cannot explain every change, stop and ask.

## Stop Conditions

Stop and report when:

- canonical docs conflict (see Authority Hierarchy)
- production data could be affected
- a destructive migration is required
- a security invariant must be weakened
- a secret would need exposure
- unknown working-tree changes could be lost
- the implementation crosses approved scope
- tests can pass only by weakening them

## Forbidden Actions

- Hard-code production project content
- Restore an environment-password auth fallback
- Expose secrets (never print or commit credential values)
- Use production as a destructive test database
- Weaken security tests
- Silently rewrite the CMS architecture
- Silently change the database provider (see `docs/adr/ADR-008.md`)
- Silently replace Cloudinary uploads
- Bypass the typed case-study architecture (`docs/adr/ADR-003.md`)
- Push, merge, or deploy without permission

## Completion Requirements

At minimum, all must pass before work is considered done:

- TypeScript (`npx tsc --noEmit`)
- ESLint (`npm run lint`)
- tests where applicable (`npm test`)
- production build (`npm run build`)
- security regression checks (no weakening)
- Git diff review (no secrets, no generated/log files, working tree understood)
