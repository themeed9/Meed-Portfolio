# Richard Ekwonye Portfolio Replication — Rule Document

## Overview
Replicate the animation, layout, architecture, and content writing style of [richardekwonye.com](https://richardekwonye.com) into the Meed Portfolio, **while keeping all existing design tokens unchanged**.

---

## 1. What We Are Replicating (from richardekwonye.com)

### 1.1 Loading Screen (MAX 3 SECONDS)
- Full-screen black background with animated progress counter (0–100%)
- Counter animates smoothly using `requestAnimationFrame` or GSAP
- **Hard cap: 3 seconds max** — if assets load faster, still take ~2.5s for feel; if slower, cut short at 3s
- After loading completes, screen slides up/fade out revealing the site
- Minimalist: just the number + thin progress bar at bottom

### 1.2 Scroll-Triggered Text Reveals
- **Big text reveal**: Large heading text clips/reveals word-by-word or line-by-line as user scrolls
- Uses `clip-path` or `transform: translateY(100%)` on each word/line
- Triggered by scroll position (GSAP ScrollTrigger or framer-motion `useInView`)
- Text starts hidden (clipped/offset) and reveals as section enters viewport

### 1.3 Marquee / Infinite Scroll Text
- Horizontal infinite scrolling text band between sections
- Text repeats seamlessly (CSS animation or GSAP)
- Used as a section divider / visual break
- Content: key phrases like "Product Design · UI/UX · Design Systems · AI-First"

### 1.4 Project Showcase Grid
- Asymmetric masonry-style grid (not uniform 2-col)
- Large hero project + smaller secondary projects
- Hover reveals project details (overlay with title, category, arrow)
- Smooth scale + opacity transitions on hover
- Click opens project with page transition

### 1.5 Section Transitions
- Sections don't just "appear" — they transition with parallax-like effects
- Content fades in with slight upward movement
- Staggered children animations (each element animates slightly after the previous)
- Background color shifts between sections create visual separation

### 1.6 Smooth Scroll
- Buttery smooth scrolling (Lenis or similar)
- Momentum-based scrolling with easing
- Scroll-linked animations feel fluid

### 1.7 Navigation
- Fixed top nav with logo left, links center, CTA right
- Nav background changes on scroll (transparent → solid)
- Smooth link transitions
- Mobile: hamburger → full-screen overlay menu with staggered link animations

### 1.10 Content Writing Style
- Short, punchy sentences
- First person, conversational tone
- Big bold headings with thin/light subtitles
- Strategic use of whitespace

---

## 2. What We Are NOT Changing
- All design tokens (`tokens/design-tokens.css`, `tokens/color-token.json`, `tokens/design-token.json`)
- Color palette (primary, secondary, tertiary, neutral, error)
- Typography scale (display, headline, title, body, label sizes)
- Spacing scale
- Border radius values
- Shadow/elevation system
- The admin panel, API routes, Prisma schema, auth system
- Mobile-first responsive approach

---

## 3. Technical Stack for Animations

### Current: framer-motion (no-op)
All `motion.div` wrappers currently have `initial={{ opacity: 1, y: 0 }}` — zero actual animation.

### Target: GSAP + ScrollTrigger + Lenis
| Library | Purpose |
|---------|---------|
| `gsap` | Core animation engine (tweens, timelines) |
| `@gsap/react` | React integration (`useGSAP` hook) |
| `lenis` | Smooth scroll |
| `@studio-freight/lenis` | (alternative) smooth scroll |

**Why GSAP over framer-motion for this:**
- ScrollTrigger is far more powerful for scroll-linked animations
- Better performance for complex timelines
- Text splitting/revealing is simpler
- More control over easing and sequencing

---

## 4. Component Architecture Changes

### New Components to Create
```
components/
  loading/
    LoadingScreen.tsx          # Full-screen loading with counter (max 3s)
  effects/
    TextReveal.tsx             # Scroll-triggered text reveal (word-by-word)
    Marquee.tsx                # Infinite horizontal scrolling text
    SmoothScroll.tsx           # Lenis provider wrapper
    ParallaxSection.tsx        # Parallax wrapper for sections
    StaggerChildren.tsx        # Stagger animation wrapper
  layout/
    Navbar.tsx                 # Updated with scroll-based background
    Footer.tsx                 # Updated with animations
```

### Components to Rewrite
```
components/
  home/
    Hero.tsx                   # Big text reveal + full-screen hero
    FeaturedProjects.tsx       # Asymmetric showcase grid
    AiWorkflow.tsx             # Staggered step reveal
    SkillsOverview.tsx         # Animated skill cards
    TestimonialSection.tsx     # Testimonial cards with reveal
  projects/
    ProjectCard.tsx            # Hover overlay + scale effect
```

---

## 5. Implementation Plan (Ordered)

### Phase 1: Foundation
1. Install GSAP, Lenis, @gsap/react
2. Create `SmoothScroll` provider (Lenis wrapper)
3. Create `LoadingScreen` component (max 3s hard cap)
4. Create `TextReveal` component (word-by-word scroll reveal)
5. Create `Marquee` component
6. Update root layout with LoadingScreen + SmoothScroll

### Phase 2: Hero + Value Proposition
7. Rewrite `Hero.tsx`:
   - Full-screen height
   - Big text reveal animation (title words animate in on scroll/load)
   - Badge pill animates in
   - Subtitle fades in
   - CTAs slide up
   - Background image with parallax
8. Create Value Proposition section (new):
   - Big statement: "I help startups ship products 3x faster"
   - Full-width, large typography
   - Scroll-triggered reveal

### Phase 3: Home Sections
9. Rewrite `FeaturedProjects.tsx`:
   - Asymmetric grid (1 large + 2 small, or 2 large + 1 small)
   - Hover overlay with project info
   - Scroll-triggered reveal for each card
10. Rewrite Impact Stats section:
    - Animated counters (use GSAP or framer-motion number animation)
    - Clean 4-column grid
11. Rewrite `AiWorkflow.tsx`:
    - Staggered step reveal
    - Animated connector lines
12. Rewrite `SkillsOverview.tsx`:
    - Cards stagger in on scroll
    - Icon animations on hover
13. Rewrite `TestimonialSection.tsx`:
    - Cards reveal with stagger
    - Star rating animation

### Phase 4: Navigation & Polish
14. Update `Navbar.tsx`:
    - Transparent → solid on scroll
    - Mobile menu: full-screen overlay with staggered links
15. Add section transitions between all sections
16. Add marquee dividers between key sections
17. Add CTA section with text reveal

### Phase 5: Verification
18. Verify build passes
19. Test all animations on mobile
20. Verify `prefers-reduced-motion` disables animations
21. Performance check (no layout shift, smooth 60fps)

---

## 6. Animation Details

### Loading Screen (MAX 3s)
```tsx
// Pseudocode
- State: progress (0-100), isLoading (true/false)
- useEffect: animate progress from 0 to 100 over ~2.5s using GSAP
- Hard cap: setTimeout at 3000ms forces isLoading = false
- When progress reaches 100 OR 3s elapsed: isLoading = false
- Motion: loading screen slides up (y: 0 → -100%) with fade
- Site content fades in underneath
```

### Text Reveal (Word-by-Word)
```tsx
// Pseudocode
- Split heading text into words
- Each word wrapped in overflow:hidden span
- Inner span has transform: translateY(100%) initially
- On scroll trigger: translateY(100%) → translateY(0)
- Stagger between words: 0.03-0.05s
```

### Marquee
```tsx
// Pseudocode
- Container with overflow:hidden
- Inner track with duplicated content (2x)
- CSS animation: translateX(0) → translateX(-50%)
- Duration: 20-30s linear infinite
- Pause on hover (optional)
```

### Project Card Hover
```tsx
// Pseudocode
- Image scales up slightly (1 → 1.05) on hover
- Dark overlay fades in (opacity 0 → 0.6)
- Title + category + arrow slide up from bottom
- Cursor changes to "view" indicator
```

### Smooth Scroll (Lenis)
```tsx
// Pseudocode
- Initialize Lenis with { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }
- RAF loop: requestAnimationFrame(lenis.raf)
- GSAP ScrollTrigger integration: lenis.on('scroll', ScrollTrigger.update)
```

---

## 7. Page Section Order (Homepage — Startup Pitch Flow)

The narrative follows a startup pitch structure: Hook → Problem → Proof → Numbers → Process → Capabilities → Trust → Close.

```
1. LoadingScreen (overlay, max 3s, disappears)
2. Navbar (fixed, transparent → solid on scroll)
3. HERO — "Who I am" (full-screen, big text reveal, background image)
4. MARQUEE — Divider ("Product Design · UI/UX · Design Systems · AI")
5. VALUE PROPOSITION — "What I solve" (big statement: I help startups ship products faster)
6. FEATURED PROJECTS — "Show don't tell" (asymmetric showcase grid)
7. IMPACT STATS — "Quantified results" (animated counters: projects shipped, % conversion lift, etc.)
8. MARQUEE — Divider
9. AI WORKFLOW — "How I work" (5-step process with staggered reveal)
10. SKILLS — "What I bring" (capabilities grid)
11. TESTIMONIALS — "Others vouch" (staggered testimonial cards)
12. CTA — "Let's build" (big text reveal + button)
13. Footer
```

---

## 8. Critical Rules

1. **Design tokens are immutable** — only animation/layout/architecture changes
2. **All animations must respect `prefers-reduced-motion`** — disable when user prefers
3. **Performance first** — use `will-change`, `transform` only, avoid animating layout properties
4. **No layout shift** — all animations must be GPU-accelerated (transform, opacity only)
5. **Mobile animations are simpler** — reduce complexity on small screens
6. **Loading screen is optional** — if it slows perceived performance, skip it
7. **GSAP cleanup** — all GSAP instances must be killed on component unmount
8. **Keep the fallback system** — database queries still use `.catch(() => fallback)`
