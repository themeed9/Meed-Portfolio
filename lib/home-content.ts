import { z } from "zod";

// Homepage and brand-page copy (ADR-010 phase 5). Each section is a SiteContent key edited in
// Admin → Content. Values are validated here; a missing or invalid value falls back to the
// owner's Figma copy below, so a typo in the CMS can never break the page.

const text = (max: number) => z.string().trim().min(1).max(max);
const href = z.string().trim().min(1).max(500);
const image = z.object({ src: href, alt: text(300) });

export const homeHeroSchema = z.object({
  status: text(80),
  headline: text(160),
  intro: text(500),
  ctaText: text(40),
  ctaLink: href,
  rolesText: text(160).optional(),
  rolesLink: href.optional(),
  image: image.optional(),
  /** Full-bleed photo behind the hero text and image. Falls back to HERO_BACKGROUND. */
  background: image.optional(),
});

export const homeStripSchema = z.object({
  // Placeholder tiles shown after the real projects until their case studies are published.
  placeholders: z.array(z.object({ title: text(80), note: text(40) })).max(12),
});

export const moreWorkSchema = z.object({
  label: text(60),
  items: z.array(z.object({ title: text(80), description: text(160), href: href.optional() })).max(12),
});

export const homeAboutSchema = z.object({
  label: text(60),
  statement: text(600),
  image: image.optional(),
});

export const beyondSchema = z.object({
  label: text(60),
  ai: z.object({ label: text(40), title: text(80), body: text(600), videoUrl: href.optional(), videoCaption: text(80) }),
  founder: z.object({ label: text(40), title: text(80), body: text(300), interests: text(400).optional() }),
  brand: z.object({ label: text(60), title: text(80), body: text(400), linkText: text(60) }),
});

export const homeContactSchema = z.object({
  headline: text(120),
  email: z.string().trim().email().optional(),
  githubUrl: href.optional(),
  resumeUrl: href.optional(),
});

export const siteFooterSchema = z.object({ copyrightName: text(80), version: text(80).optional() });

export const brandPageSchema = z.object({
  backText: text(40),
  label: text(60),
  title: text(120),
  intro: text(500),
  emptyText: text(200),
});

export type HomeHero = z.infer<typeof homeHeroSchema>;
export type MoreWork = z.infer<typeof moreWorkSchema>;
export type HomeStrip = z.infer<typeof homeStripSchema>;
export type HomeAbout = z.infer<typeof homeAboutSchema>;
export type Beyond = z.infer<typeof beyondSchema>;
export type HomeContact = z.infer<typeof homeContactSchema>;
export type SiteFooter = z.infer<typeof siteFooterSchema>;
export type BrandPage = z.infer<typeof brandPageSchema>;

/**
 * Default hero background: pale blue sky over white clouds (Unsplash photo-1499346030926, free under
 * the Unsplash License, self-hosted). Chosen because it is light and even where the text sits, so
 * the hero text keeps WCAG AA contrast; a soft wash in CSS guarantees it (see .home-hero-bg).
 */
export const HERO_BACKGROUND = { src: "/images/hero-sky.webp", alt: "" } as const;

export const OWNER_EMAIL = "contacthameedhere9@gmail.com";

export const homeDefaults = {
  hero: {
    status: "Product Designer in Lagos, Nigeria",
    headline: "I design clear, scalable products for fintech, insurance and early-stage teams.",
    intro: "Six years across financial products, marketplaces and digital interfaces. I design the core flows, document the decisions and build what I design with React, Next.js and TypeScript.",
    ctaText: "See selected work",
    ctaLink: "#selected-work",
    rolesText: "Open to senior Product Designer and AI Product Designer roles",
    rolesLink: "/contact",
  } satisfies HomeHero,
  strip: {
    placeholders: [
      { title: "Solar-8", note: "Coming soon" },
      { title: "ClinIQ", note: "Coming soon" },
      { title: "KudiPouch", note: "Coming soon" },
      { title: "AI-built WordPress site", note: "Coming soon" },
      { title: "Meed Cordwainer", note: "Coming soon" },
      { title: "Next case study", note: "In progress" },
    ],
  } satisfies HomeStrip,
  moreWork: {
    label: "More work",
    items: [
      { title: "BackRock Insurance", description: "Responsive insurance experience", href: "/work/backrock-insurance" },
      { title: "ClinIQ", description: "AI-oriented healthcare application" },
      { title: "KudiPouch", description: "Financial product brand and website content", href: "/brand" },
      { title: "AI-built WordPress site", description: "AI-assisted build and customization" },
    ],
  } satisfies MoreWork,
  about: {
    label: "About",
    statement: "I’m a product designer in Lagos with six years across fintech, insurance, e-commerce, marketplaces and early-stage products. I design financial and insurance products at TrustBanc Financial Group, and I build what I design.",
    image: { src: "/images/abdulhameed-abdulsalam.webp", alt: "Abdulhameed Abdulsalam, seated, in a light blue shirt and striped tie" },
  } satisfies HomeAbout,
  beyond: {
    label: "Beyond product design",
    ai: {
      label: "In development",
      title: "The AI That Oversabi",
      body: "A Nigerian 3D animated comedy, planned as a 45-minute story told in short episodes for TikTok, Instagram Reels and YouTube Shorts. Production uses Veo with structured scene prompts to keep characters and voices consistent.",
      videoCaption: "No episodes released yet",
    },
    founder: {
      label: "Founder",
      title: "Meed Cordwainer",
      body: "A bespoke footwear and leather brand I founded in 2023.",
      interests: "I also write and explore storytelling, filmmaking and animation. They shape how I think about narrative in product work.",
    },
    brand: {
      label: "Brand and graphic design",
      title: "Brand identity and visual design",
      body: "Brand identity and graphic design work, including KudiPouch and Meed Cordwainer.",
      linkText: "View brand and graphic work",
    },
  } satisfies Beyond,
  contact: {
    headline: "Let’s talk about your product.",
    email: OWNER_EMAIL,
    githubUrl: "https://github.com/themeed9",
    resumeUrl: "/resume",
  } satisfies HomeContact,
  footer: { copyrightName: "Abdulhameed Abdulsalam", version: "Portfolio v2 · November 2026" } satisfies SiteFooter,
  brandPage: {
    backText: "Back to home",
    label: "Brand and graphic design",
    title: "Brand identity and visual design",
    intro: "Identity, packaging and graphic work for brands I have founded or worked with, including KudiPouch and Meed Cordwainer.",
    emptyText: "Brand projects are being prepared and will appear here soon.",
  } satisfies BrandPage,
};

export const homeContentKeys = {
  hero: "home-hero",
  strip: "home-strip",
  moreWork: "home-more-work",
  about: "home-about",
  beyond: "home-beyond",
  contact: "home-contact",
  footer: "site-footer",
  brandPage: "brand-page",
} as const;

/** Validate a stored SiteContent value; anything missing or invalid falls back to the default. */
export function resolveContent<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  const parsed = schema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}

/** Only same-site paths, in-page anchors, https and mailto links are rendered as links. */
export function safeHref(value: string | undefined | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  if (/^https:\/\//i.test(v)) return v;
  if (/^mailto:/i.test(v)) return v;
  return null;
}

export function isExternal(link: string): boolean {
  return /^https:\/\//i.test(link);
}


/** Placeholder tiles not already covered by a real project (matched by title, case-insensitive). */
export function stripPlaceholders(strip: HomeStrip, projectTitles: string[]) {
  const taken = projectTitles.map((title) => title.toLowerCase());
  return strip.placeholders.filter((item) => !taken.some((title) => title.startsWith(item.title.toLowerCase())));
}
