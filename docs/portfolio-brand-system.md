# Meed Portfolio Brand System

This specification is the project-local visual contract for the public portfolio. Its purpose is consistency and recognisability, not decoration. The work remains the primary visual subject.

## 1. Brand attributes

Senior, editorial, sophisticated, understated, intelligent, intentional, contemporary, visually quiet, product-focused, and technically credible.

Core principle: **simplicity through discipline**. The portfolio should communicate that the person who designed it cares about information architecture, states, design tokens, accessibility, and implementation quality.

## 2. Typography

Use Geist Sans for interface and editorial copy, and Geist Mono only for compact technical metadata where it improves scanning. Use three weights: 400, 550/600, and 700 only when exceptional emphasis is necessary.

Typography carries hierarchy. Labels describe sections; headlines communicate decisions, tensions, insights, or outcomes.

## 3. Type scale

| Role | Responsive size | Line height | Use |
|---|---:|---:|---|
| Display | clamp(3rem, 7vw, 6.75rem) | 0.98–1.02 | Homepage statement only |
| H1 | clamp(2.5rem, 5vw, 4.75rem) | 1.02–1.08 | Page and project titles |
| H2 | clamp(2rem, 3.5vw, 3.5rem) | 1.08–1.15 | Decision and insight headlines |
| H3 | 1.25–1.5rem | 1.25–1.35 | Supporting sections |
| Body Large | 1.125–1.25rem | 1.55–1.7 | Project introductions |
| Body | 1rem | 1.65–1.75 | Primary reading |
| Small | 0.875rem | 1.5–1.6 | Captions and secondary copy |
| Micro | 0.75rem | 1.4 | Labels and metadata only |

Keep body copy near 60–72 characters per line. Avoid more than two large type roles in one viewport.

## 4. Grid

Use one shell across public pages:

- Maximum content width: 1200px.
- Desktop: 12 columns, 24px gutters, 32px outer padding.
- Tablet: 8 columns, 20px gutters, 24px outer padding.
- Mobile: 4 columns, 16px gutters, 20px outer padding; reduce to 16px only at 320px when required.
- Editorial reading column: 640–720px.
- Wide evidence may span 8–12 columns while copy remains narrow.

Do not create independent section widths unless evidence intentionally breaks out of the editorial column.

## 5. Spacing scale

Use: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160px.

- Inline UI: 4–12px.
- Component interiors: 16–32px.
- Related content groups: 24–48px.
- Section transitions: 64–128px.
- Major case-study acts: 96–160px.

Whitespace separates ideas. Do not add spacing merely to make a section feel premium.

## 6. Colour system

Use a neutral shell and one restrained green accent.

- Background: #FFFFFF / dark #07100B.
- Secondary surface: #F7F8F7 / dark #0D1510.
- Primary text: #07100B / dark #F7FAF8.
- Secondary text: #465149 / dark #CBD2CD.
- Muted text: #707A73 / dark #98A29B.
- Subtle border: #E7EAE8 / dark #202A23.
- Accent: #257A4C / dark #62C88F.

Project brand colours may appear inside screenshots and tightly controlled evidence frames. Avoid gradients and section-by-section colour themes.

## 7. Radius system

- 0px: editorial sections and structural groups.
- 8px: controls, tags, and small functional UI.
- 12px: screenshots and evidence frames.
- 999px: pills only when the pill shape communicates a compact action or tag.

Do not use large rounded containers as a default composition technique.

## 8. Border system

Use 1px subtle borders for structural separation and controls. Use stronger borders only for focus or active states. Shadows are exceptional: one low-elevation token may be used for temporary overlays, never as routine card styling.

## 9. Image treatment

Treat project imagery as evidence. Prefer raw screens, interface states, flows, before/after comparisons, annotated decisions, system architecture, and interaction clips. Use `object-fit` deliberately; do not crop away the decision being discussed. Frames use a subtle border and 12px radius at most. Device mockups are optional and secondary.

## 10. Icons

Use one outlined icon family. Standard sizes: 16px inline, 20px functional, 24px exceptional. Icons support labels; they do not replace clear language. Align optically with text and use `aria-hidden` for decorative icons.

## 11. Case-study visual language

Structure each act as:

1. Meaningful statement
2. Short explanatory copy
3. Wide evidence
4. Caption or annotation
5. Decision and trade-off
6. New tension or next question

Keep metadata compact and secondary. Avoid repetitive cards for every research finding. Use comparisons and annotations when they make reasoning visible.

## 12. Motion language

Motion is calm, precise, restrained, and explanatory. Use 120–180ms for fast feedback, 180–280ms for standard transitions, and 300–500ms for purposeful editorial reveals. Prefer opacity and transform. Primary content renders immediately. Reduced motion removes smooth scrolling, parallax, and non-essential transforms while preserving information.

## 13. Responsive principles

- Preserve narrative order before preserving desktop composition.
- Collapse multi-column layouts into a single reading flow.
- Keep touch targets at least 44px.
- Prevent headline overflow and orphaned controls at 320px.
- Let diagrams scroll only when simplification would destroy meaning; clearly signal horizontal overflow.
- Test at 320, 375, 430, 768, 1024, 1280, and 1440+ pixels.

## 14. Accessibility standards

Use semantic landmarks and ordered headings, keyboard-operable navigation, visible focus, labelled controls, descriptive alternative text, sufficient contrast, minimum touch targets, reduced-motion support, and content that remains understandable without animation. Do not claim WCAG conformance without formal testing.

## 15. Avoid

- Generic SaaS hero compositions and service grids.
- Glassmorphism, neon gradients, floating shapes, and AI imagery.
- Rounded card + grey border + shadow as a default pattern.
- Excessive badges, pills, device mockups, and animated text splitting.
- Wide long-form copy, arbitrary section widths, and one-off spacing.
- Decorative UX artifacts or screenshots without explanatory value.
- Motion that delays reading, hijacks scrolling, or exists only to impress.
