---
name: portfolio-design-and-motion
description: Pixel-perfect layout (using Tailwind tokens) and smooth animation/page-transition conventions (using Framer Motion) for this Next.js portfolio
---

# Portfolio Design & Motion

Use for creating or editing components, pages, layouts, styling, transitions, hover effects, scroll effects, or navigation.

## Layout Rules
- All spacing/colors/radii from `@theme` in `app/globals.css` or CSS var tokens — no arbitrary values
- Spacing scale: 4px increments via `--spacing-*` tokens
- Page wrapper: `max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]` — or use `<Container />`
- Semantic aliases: `--spacing-section-y`, `--spacing-section-y-sm`, `--spacing-container-x`
- Typography via `--font-size-*` and `--line-height-*` tokens from `tokens/design-tokens.css`
- Grid: CSS grid for multi-column, flex for linear layouts
- Colors: always reference semantic tokens (`bg-surface`, `text-on-surface`, `border-outline-variant`)

## Animation Rules (Framer Motion + GSAP)
- Page transitions: `<PageTransition>` component wrapping content in layout, uses `AnimatePresence mode="wait"` with `pageTransitionVariants`
- Scroll entrances: `<FadeIn>` component uses `fadeInUp` variant with `viewport={{ once: true }}`
- GSAP reserved for complex scroll-triggered sequences (per Richard Ekwonye replication spec); Framer Motion for page transitions and simple entrances
- Shared constants in `lib/motion.ts`: `easeStandard`, `easeEntrance`, `easeTransition`, `durations.{micro,entrance,page}`, `fadeInUp`, `staggerContainer`
- Micro-interactions: `whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}` with `durations.micro`
- Only animate `transform`, `opacity`, `filter`
- Respect `prefers-reduced-motion` in all components
