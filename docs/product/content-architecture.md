# Meed Portfolio — Content Architecture

This document is specific to Meed Portfolio. It defines what a project/case study **is**, what each project is
responsible for, and how the CMS content model serves it. Read it before creating or editing portfolio content.

## A case study is not just a CMS record

A case study's job is to communicate **product judgment**. The CMS record holds the raw material; the renderer and
the visual system decide how it reads. Three layers cooperate:

1. **CMS fields define content** — the `Project` record and its typed `CaseStudySection` blocks hold the material.
2. **A reusable renderer defines presentation** — one set of components renders every project (see ADR-003).
3. **The Figma-approved frontend defines visual structure** — the editorial system in `docs/portfolio-brand-system.md`
   and the taste/motion skills dictate composition, hierarchy, and restraint.

Every project may use a different block sequence, and not every project needs every block. Blocks are ordered in the
CMS. An empty/omitted block is simply not rendered.

## Conceptual project structure

A project can draw on any of these blocks. Content should follow an evidence-led arc, not a template:

```
Project
├── Recruiter Summary        recruiterSummary — one-paragraph positioning (frontmatter, not a block)
├── Hero                     hero image/statement
├── Role                     what you personally did (role field / project_tldr)
├── Platform                 web, mobile, internal tool, AI-assisted, ...
├── Status                   shipped, launched, in-market, ended, ...
├── Problem                  problem_statement
├── Product Hypothesis       project_tldr.hypothesis / product_principle
├── Evidence                 evidence blocks (finding → evidence → implication)
├── Decisions                decision blocks (context → decision → rationale → tradeoff → outcome)
├── Trade-offs               tradeoff blocks (options → benefit/cost → decision)
├── User/Business Context    supporting context in prose
├── Product Screens          annotated_screen, gallery, user_flow, interaction_states
├── Design System            design_system blocks
├── Architecture             architecture_diagram (where relevant)
├── Outcomes                 outcome blocks (result → evidence → caveat)
├── Reflection               reflection blocks
└── Next Steps               next_steps
```

## Content rules

- **Evidence is preferred over generic UX-process filler.** Statements without evidence, or generic process copy,
  weaken the portfolio. When a block cannot be supported with evidence, omit it.
- **Unverified metrics must never be invented.** Never fabricate numbers, results, or artifacts to improve appearance
  (this is a security-of-truth invariant for content, not just an aesthetic rule).
- Headlines should express decisions, tensions, insights, or outcomes — not labels like "Design" or "Process".
- Every image in a case study must provide evidence (raw screens, annotations, states, flows, comparisons, diagrams).

## Flagship positioning

The flagship projects have defined positioning. Do not populate or rewrite these projects during foundation work;
their content lives in the CMS and must not be hard-coded.

| Project | Positioning |
|---|---|
| GoFinancial | 0→1 product thinking / fintech / AI-assisted implementation |
| Solar-8 | marketplace / commerce / decision-support / trust |
| Limelight Springs College | design systems / IA / accessibility / governance |

## Editing content

- Content is edited in the CMS (`/admin`), not in source code (see ADR-001 and ADR-006).
- A new project = a new CMS record, not a new React page.
- Development-only fixtures in `lib/dev-portfolio-fixtures.ts` are gated to `NODE_ENV === "development"` and must
  never leak into production.
