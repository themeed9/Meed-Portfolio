# Meed Portfolio — Documentation Index

This file tells agents and humans which documents to read and which are historical. Do not read every historical
report before starting normal work.

## READ FIRST (canonical)

1. `ARCHITECTURE.md` (repository root) — current architecture reality
2. `AGENTS.md` (repository root) — agent rules, authority hierarchy, stop conditions
3. `docs/adr/` — approved architecture decisions (ADR-001 … ADR-009)
4. `docs/product/content-architecture.md` — what a project/case study is
5. `docs/security/security-regression-contract.md` — security invariants (SEC-INV-001 … 010)
6. Current approved phase/task specification
7. `docs/portfolio-brand-system.md` — visual contract (also referenced by the skills)

## Reference (consult when relevant)

- `docs/security/security-credential-containment.md` — redacted record of exposed credential inventory and rotation
- `docs/security/security-dependency-remediation.md` — record of dependency remediation and the audit result
- `docs/portfolio-ui-audit.md` — UI audit against the taste/motion skills (useful checklist, not current state)
- `docs/screenshots/**` — visual evidence from past phases
- `skills/product-portfolio-taste/SKILL.md`, `skills/product-portfolio-motion/SKILL.md` — authoritative taste/motion rules
- `docs/DEFINITION_OF_DONE.md` — definition of done
- `docs/RELEASE_CHECKLIST.md` — release flow

## Historical (do not read before normal work)

- `docs/security-audit.md` — before-state security audit + post-hardening re-score
- `docs/security-hardening-plan.md` — proposed plan; the code-level items are implemented
- `docs/codebase-architecture-audit.md` — architecture/cleanup audit; its architecture map predates the current redesign
- `docs/architecture-hardening-report.md` — phase report; partly superseded by the redesign
- `docs/phase-3-design-system-report.md`, `docs/phase-3b-visual-direction-report.md`,
  `docs/phase-3c-visual-refinement-report.md` — visual phase reports

## Classification legend

| Class | Meaning |
|---|---|
| CANONICAL | Current contract; read first; changes require owner approval |
| REFERENCE | Consult on demand; not the current contract |
| HISTORICAL REPORT | Record of what happened; not authoritative for current state |
| SUPERSEDED | Replaced by a newer decision (see `docs/adr/ADR-008.md` re: Neon) |
| TEMPORARY | Working notes; expect replacement |
