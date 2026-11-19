# Third-party agent skills

Four public skills for design and motion, vendored unchanged except where noted. They help agents (Claude Code) design and animate this site. They are **advice, not authority**.

## Precedence (read this first)

These skills rank **below** everything in the `AGENTS.md` authority hierarchy, including the project-local skills in `skills/`. When a skill here disagrees with the repository, the repository wins:

1. Owner decisions recorded in `docs/adr/` and `docs/portfolio-brand-system.md`
2. ADR-009 (motion is purposeful and restrained) and `skills/product-portfolio-motion/SKILL.md`
3. `skills/product-portfolio-taste/SKILL.md`
4. Then these skills

Known conflicts, already decided by the owner. Do not "fix" them:

- `frontend-design` discourages `01 / 02 / 03` numbering, `→` on buttons and all-caps labels. The owner chose to keep numbering and arrows (ADR-010, 2026-11-18).
- `motion` covers parallax and scroll-linked effects. ADR-009 rules these out on this site.
- `motion` recommends installing the `motion` package. This site already uses `framer-motion` (same API). Do not add a second animation library.
- Any motion must keep content visible on first paint and respect `prefers-reduced-motion` (ADR-009, brand system §12).

## What is here

| Skill | Use it for | Source (commit) | Licence |
|---|---|---|---|
| `frontend-design` | Overall visual direction and avoiding templated design | [anthropics/skills](https://github.com/anthropics/skills) `skills/frontend-design` (`e4bb5d9`) | Apache-2.0 (`LICENSE.txt`) |
| `emilkowalski-motion` | Restrained micro-interactions after a screen exists: 140–220 ms, transform and opacity only | [nexu-io/open-design](https://github.com/nexu-io/open-design) `skills/emilkowalski-motion` (`0725880`) | Apache-2.0 (`LICENSE`, the repository licence) |
| `design-motion-principles` | Creating motion, or **auditing** existing motion for generic patterns | [kylezantos/design-engineer-auditor-package](https://github.com/kylezantos/design-engineer-auditor-package) `skills/design-motion-principles` (`4a9ca87`) | MIT (`LICENSE`) |
| `motion` | Correct Framer Motion code: springs, layout animations, reduced motion, bundle size, Next.js client components | [secondsky/claude-skills](https://github.com/secondsky/claude-skills) `plugins/motion/skills/motion` (`8837836`) | MIT (`LICENSE`) |

### Left out on purpose

- From `motion`: the `scripts/` folder (`init-motion.sh` installs a second animation package and writes files into a `src/` folder this repo does not have) and the `templates/` folder (includes a scroll-parallax demo). `SKILL.md` still mentions both; they are not present here.
- `design-taste-frontend` (taste-skill) was reviewed and **not** installed: it registers a Stop hook that runs a Node script automatically after every agent turn, ships about 40 MB of assets, requires Chrome, and its house rules conflict with this site (for example, no captions under images).

## Updating

Review any new version in full before replacing a folder here (look for hooks, scripts, package installs and network calls), and record the new commit in the table above.
