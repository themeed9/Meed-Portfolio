---
name: product-portfolio-motion
description: Motion and interaction authority for the Meed-Portfolio repository. Use whenever adding, reviewing, debugging, or removing animation, smooth scrolling, hover behaviour, page transitions, scroll effects, prototype media, or reduced-motion behaviour in the public portfolio. Framer Motion is the approved motion library.
---

# Product Portfolio Motion

Read `docs/portfolio-brand-system.md` before changing motion. Make content readable immediately. Motion exists to explain what changed, what belongs together, where attention should move, or how elements relate spatially—not to advertise technical capability.

## Approved motion library

- **Framer Motion is the approved motion library currently present.**
- **GSAP is not installed.**
- **Lenis is not installed.**
- Do not reintroduce GSAP or Lenis without an explicit ADR or owner approval.

## Character

Use calm, precise, restrained, responsive, smooth, physically believable movement. Avoid bounce-heavy or elastic effects, dramatic rotation, floating decoration, excessive parallax, mouse-following, scroll-jacking, intro loaders, excessive text splitting, and constant motion.

## Timing vocabulary

- Fast interaction: 120–180ms
- Standard UI transition: 180–280ms
- Editorial reveal: 300–500ms only when it supports reading

Use a small shared easing set (`lib/motion.ts`). Do not invent durations or curves per component.

## Implementation rules

- Prefer opacity and transform.
- Avoid repeatedly animating width, height, top, left, or large shadows.
- Keep page transitions short and non-blocking.
- Never delay primary content or navigation.
- Use subtle project-card image, metadata, and arrow responses; avoid tilt, 3D perspective, and magnetic interactions.
- Use explanatory case-study motion for before/after comparisons, hotspots, state transitions, architecture diagrams, sticky navigation, timeline progress, or prototype loops.
- Use Framer Motion only where it adds demonstrable explanatory value.

## Framer Motion / Motion component guidance

- Use `motion` components deliberately. A motion component is justified only when it animates on entry, state change, or user feedback; do not wrap static content "just in case".
- **`whileInView` only where meaningful** — hero statements, section headers, and evidence media. Prefer one-time, viewport-triggered reveals over replaying animation on every scroll pass.
- **Text reveal choreography:** respect reading order; reveal in one or two groups; avoid split-every-word effects unless they genuinely support comprehension. Large display type may reveal once; body copy should simply appear.
- **Project-image transitions:** subtle opacity/scale on reveal and a restrained hover response (max ~1.5% scale). No tilt, 3D, or magnetic behaviour on images.
- **Layout animations** (`layout`/`layoutId`): use only when they clarify a state change (expanding, filtering, reordering). Never use layout animation for decorative reflow.
- **Reduced motion:** treat `prefers-reduced-motion` as a first-class mode — disable reveals, parallax, scale, and non-essential transforms; show content immediately. Use `useReducedMotion` (or CSS-based toggles) rather than relying on `MotionConfig` alone, and verify manually.
- **Mobile performance:** stick to transform/opacity; avoid blur and heavy shadows; keep the animated scope small; test on low-end devices before approval.
- **Cleanup:** dispose of scroll/viewport listeners, clear timeouts, and stop loops on unmount. Avoid orphaned `useScroll`/`useInView` subscriptions and duplicate motion wrappers. Remove motion components that no longer animate.

## Smooth scrolling

- Do not hijack scroll. Native scroll, browser history, keyboard navigation, anchor links, focus movement, and accessibility must remain intact.
- Achieve the **premium smooth scroll feel** through restrained Framer Motion transitions and content pacing — never by replacing native scroll.
- Disable any custom smooth-scrolling behaviour when reduced motion is requested or when it harms platform behaviour.

## Reduced motion

Treat `prefers-reduced-motion` as a first-class mode:

- Disable smooth scrolling where necessary.
- Remove parallax and non-essential transforms.
- Show content immediately.
- Preserve all information and interactive affordances.
- Ensure videos do not autoplay essential information without controls or an equivalent static explanation.

## Approved visual direction

- **Editorial and evidence-led:** the work is the subject. Motion supports reading, hierarchy, and comprehension; it never competes with the content.
- **Newspaper/paper tactile background:** subtle, quiet surface qualities are welcome. Keep motion paper-like and understated — no glass, glow, or parallax layers.
- **Premium smooth scroll feel and Apple-like quality in pacing** — the restraint, ease-curve quality, and timing — not literal Apple imitation. Motion should feel inevitable, never showy.

## Review routine

For every motion decision, document:

1. Purpose: what relationship, change, or state it explains.
2. Trigger: user action, state change, or viewport entry.
3. Duration and easing token.
4. Reduced-motion equivalent.
5. Performance and cleanup behaviour.

Remove the motion if its purpose cannot be stated precisely. Test desktop hover with keyboard focus, mobile performance, anchor navigation, back/forward navigation, and reduced-motion mode before approval. Also verify that adding motion did not create an unnecessary client/hydration boundary.
