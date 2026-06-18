# Antigravity Master Prompt — Portfolio Website Build

## 1. Setup (one-time)
Copy each of the 4 skill folders into your project at:
```
<project-root>/.agents/skills/
├── portfolio-design-and-motion/SKILL.md
├── accessibility-standards/SKILL.md
├── performance-optimization/SKILL.md
└── seo-and-metadata/SKILL.md
```
Antigravity discovers these automatically and loads the relevant ones based on the task — you don't need to invoke them by name, but you can reference them explicitly in prompts for emphasis.

---

## 2. Master Prompt (paste into Antigravity chat)

> I'm building a personal portfolio website using Next.js (App Router) and Tailwind CSS, with Framer Motion for animation. Use the `portfolio-design-and-motion`, `accessibility-standards`, `performance-optimization`, and `seo-and-metadata` skills for everything you build — apply them automatically without me needing to ask each time.
>
> **Project scope:**
> - Home page with: hero section (name, title, short intro, CTA buttons), featured projects grid, skills/tech stack section, brief about section, and contact section/footer.
> - About page with fuller bio, photo, and timeline/experience.
> - Projects page listing all projects, plus individual dynamic project detail pages (`/projects/[slug]`) with images, description, tech stack, and links to live demo/GitHub.
> - Contact page or section with a working contact form (client-side validation, accessible error states).
> - Dark mode support, toggled via a button in the nav, persisted via system preference + manual override.
>
> **Design direction:**
> - [Describe your desired aesthetic here — e.g. "minimalist, lots of whitespace, monochrome with one accent color" or "bold, dark theme, large typography, gradient accents" — be specific, this drives the whole visual identity]
> - Set up the design tokens (colors, type scale, spacing aliases) in `tailwind.config.ts` first, before building any pages, per the design-and-motion skill.
>
> **Motion direction:**
> - Smooth page transitions between routes (cross-fade + slight vertical movement).
> - Scroll-triggered entrance animations for sections and project cards (staggered).
> - Subtle hover/tap micro-interactions on buttons, cards, and links.
> - Respect `prefers-reduced-motion` throughout.
>
> **Build order:**
> 1. Initialize the Next.js + Tailwind + Framer Motion project structure, set up design tokens and `lib/motion.ts` shared constants.
> 2. Build shared layout: nav (with mobile menu), footer, page transition wrapper, container component.
> 3. Build the home page sections one at a time (hero → projects grid → skills → about preview → contact/footer), applying pixel-perfect and motion standards to each.
> 4. Build the projects listing + dynamic project detail pages.
> 5. Build the about and contact pages.
> 6. Run through the accessibility, performance, and SEO checklists from each skill and fix any issues found.
>
> After each major section, pause and show me a screenshot/preview before moving to the next, so I can give feedback on the design direction early.

---

## 3. Tips for using this with Antigravity
- If Antigravity's agent starts drifting from the skill rules (e.g. using arbitrary Tailwind values, or skipping reduced-motion handling), explicitly say: *"Check this against the portfolio-design-and-motion and accessibility-standards skills and fix any violations."*
- Once your initial build is done, you can ask it to run through just the **verification checklists** in each skill as a final pass before deployment — that's an easy way to catch loose ends.
- If you add new sections later (e.g. a blog, testimonials), the skills will continue to apply automatically since they're triggered by the type of work (styling, animation, new pages), not by specific keywords.
