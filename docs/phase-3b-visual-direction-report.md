# Phase 3B visual direction report

## Direction

The final shell combines editorial product documentation with the restraint of a premium technology publication. Typography, spacing, project evidence, and decision structure provide the identity; decoration does not.

## Typography and grid

- Display is reserved for the homepage position.
- Page and project titles use H1; insight-led case-study statements can expand toward Display scale.
- Narrative remains within the 720px reading measure while evidence can use the full 1200px shell.
- Public layouts use the shared 12-column desktop composition, collapsing into an authored single-column mobile sequence.
- Micro typography is limited to context, section labels, numbering, and metadata.

## Project presentation

- Flagship projects are large editorial acts rather than cards.
- Each act combines subtle numbering, project context, a recruiter-facing statement, compact metadata, and a wide evidence image.
- Image hover is limited to a 1.5% scale response over the shared editorial motion duration.
- A development-only neutral project fixture validates the system when the CMS is empty. It is gated by `NODE_ENV === "development"` and cannot appear in production.

## Case-study presentation

- The project header uses an asymmetric statement/metadata composition and wide hero evidence.
- Narrative, insight, decision, trade-off, comparison, annotated evidence, outcome, and reflection blocks receive distinct compositions.
- Product principles and reflections support oversized editorial statements without quote-card styling.
- Decision blocks communicate Context → Decision → Why → Trade-off as a structured reading sequence.
- Trade-offs compare alternatives side by side and separate the final decision.
- Before/after evidence is side by side on desktop and stacked on mobile.
- Annotated screens support a wide visual plus numbered decision explanations.
- Outcomes distinguish verified outcome, product learning, and future hypothesis.

## Motion

- Purpose: clarify that project imagery and arrows are interactive.
- Trigger: hover or keyboard focus only.
- Timing: shared 220ms UI and 400ms editorial tokens with the standard easing curve.
- Reduced motion: all transforms collapse to near-instant, while content remains immediately visible.
- No page loader, parallax, text splitting, smooth-scroll library, or continuous animation was introduced.

## Responsive QA

- Homepage and case-study prototype passed overflow/error-overlay checks at 320, 375, 430, 768, 1024, 1280, and 1440px.
- Mobile preserves headline scale, metadata reading order, stacked comparisons, readable evidence, and 44px interaction targets.
- Desktop uses selective asymmetry without introducing independent page widths.

## Verification

- `npx tsc --noEmit`: pass
- `npm run lint`: pass
- `npm run build`: pass
- Runtime routes checked: homepage, work, prototype case study, About, résumé, and contact.
- No production database migration was applied.
- No GoFinancial, Solar-8, or Limelight content was populated.

## Remaining concerns

- The CMS must supply the final project-specific image crops, insight statements, annotations, and evidence captions; the visual system cannot compensate for weak evidence.
- Browser QA reported LCP preload suggestions for the first development-fixture project image and About portrait. These are non-blocking and should be resolved when final CMS media determines the actual above-the-fold assets.
- Formal accessibility compliance and production performance measurement remain release-stage activities.

## Readiness recommendation

The visual system is ready for GoFinancial content modelling and evidence selection. Populate one complete project first, then conduct a content-aware visual pass before entering the remaining projects.
