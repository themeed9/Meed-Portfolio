---
name: accessibility-standards
description: WCAG 2.1 AA — semantic HTML, keyboard nav, focus states, ARIA, reduced-motion support for this portfolio
---

# Accessibility Standards

Apply to every component, page, form, modal, and animated element.

## Semantic HTML
- Use `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<button>`, `<a>` — not generic divs with click handlers
- One `<h1>` per page, logical hierarchy, no skipped levels
- `<button>` for actions, `<a>` for navigation (URL changes)

## Keyboard Navigation
- Every interactive element reachable via Tab, operable with Enter/Space
- Custom components (modals, menus) implement correct ARIA roles and keyboard patterns (Escape closes)
- Logical tab order, no `tabIndex` > 0
- Skip-to-content link as first focusable element (class `skip-to-content` in `app/globals.css`)

## Focus States
- Visible focus indicator on every interactive element via `:focus-visible` (styled in `app/globals.css`)
- Never remove outline without replacement

## ARIA & Labels
- All images need meaningful `alt` text or `alt=""` if decorative
- Icon-only buttons need `aria-label` describing action
- Form inputs linked to labels via `htmlFor`/`id`, errors use `aria-describedby` and `aria-invalid`
- Live regions use `aria-live="polite"` or `role="status"`/`role="alert"`
- Decorative animated elements get `aria-hidden="true"`
- Loading buttons use `aria-busy="true"`

## Reduced Motion
- Every GSAP/Framer Motion animation checks `prefers-reduced-motion` and provides instant/reduced fallback
- No content depends on hover-only or motion-only cues
- CSS reduced-motion media query in `app/globals.css` kills all transitions/animations

## Color & Contrast
- Body text: min 4.5:1, large text: min 3:1
- Don't rely on color alone to convey information
