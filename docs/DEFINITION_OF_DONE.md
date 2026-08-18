# Definition of Done — Meed Portfolio

A change is done only when every applicable box is checked. Anything crossed out must be an explicit,
owner-approved decision.

## CODE

- [ ] Approved scope only
- [ ] No unrelated architecture changes
- [ ] No hard-coded production portfolio content
- [ ] CMS editability preserved

## DESIGN

- [ ] Approved Figma direction preserved when applicable
- [ ] Design tokens used (no arbitrary page-specific values where tokens exist)
- [ ] Responsive behavior verified (320 → 1440+)
- [ ] Reduced motion supported
- [ ] No unnecessary UI bloat

## CMS

- [ ] New project does not require source-code page creation
- [ ] Images remain replaceable
- [ ] Blocks remain editable/reorderable

## SECURITY

- [ ] Authentication regression tests pass
- [ ] Authorization regression tests pass
- [ ] Secrets absent from Git
- [ ] Upload protections preserved
- [ ] Public draft boundaries preserved

## QUALITY

- [ ] TypeScript (`npx tsc --noEmit`)
- [ ] ESLint (`npm run lint`)
- [ ] Tests (`npm test`)
- [ ] Production build (`npm run build`)
- [ ] Dependency audit acceptable

## DATABASE

- [ ] Migration reviewed
- [ ] No unintended schema changes
- [ ] No destructive production operation without approval

## GIT

- [ ] Diff reviewed
- [ ] Working tree understood
- [ ] No secrets
- [ ] No accidental generated/log files
