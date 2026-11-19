import { hexColorSchema, mediaKind, normalizeCard, pickTextColor, tint, type CardTemplate, type MediaKind, type NormalizedCard } from "./project-card.ts";

// Presentation model for one homepage card (ADR-010 phase 4). Pure, so the renderer
// stays simple and the decisions (colours, label, media shapes) are unit-tested.

export type CardProjectInput = {
  id: string;
  title: string;
  slug: string;
  description: string;
  recruiterSummary?: string | null;
  category: string;
  role?: string | null;
  status?: string | null;
  platform?: string | null;
  coverImage?: string | null;
  homepageImage?: string | null;
  primaryColor?: string | null;
  cardTemplate?: string | null;
  cardPayload?: unknown;
};

export type CardMediaView = { url: string; alt: string; aspectRatio: string; kind: MediaKind; fit?: "cover" | "contain"; poster?: string };
export type CardColors = { background: string; text: string; ratio: number; surface: string; rule: string };

export type CardView = {
  id: string;
  template: CardTemplate;
  fallback: boolean;
  href: string;
  label: string;
  title: string;
  summary: string;
  facts: { label: string; value: string }[];
  cta: string;
  colors: CardColors | null;
  card: NormalizedCard;
};

/**
 * Figma project palette (GoFinancial/bg, Solar-8/bg, SecureGate/bg). A card with no colour saved
 * in the CMS takes the next one in order, so Selected work always has the designed colour bands.
 * Setting a colour in Admin → Homepage card overrides this.
 */
// White is the primary text on these bands (owner decision, 2026-11-19). The Figma blue and orange
// are darkened just enough for white to pass WCAG AA: #1872F5 -> #1870F0 (4.55:1), #FF6900 -> #C75200
// (4.53:1). SecureGate green #0F7A44 is unchanged (5.40:1).
export const DEFAULT_CARD_PALETTE = ["#1870F0", "#C75200", "#0F7A44"] as const;

const DEFAULT_SCREEN_RATIO = "9 / 19.5";
const DEFAULT_IMAGE_RATIO = "16 / 10";

/** CSS aspect-ratio from stored dimensions, or a sensible default for the slot. */
export function aspectRatioFor(media: { width?: number; height?: number }, fallback: string = DEFAULT_IMAGE_RATIO): string {
  return media.width && media.height ? `${media.width} / ${media.height}` : fallback;
}

/** Gallery columns follow the item count, so no grid row is left with a lone item where avoidable. */
export function galleryColumns(count: number): 2 | 3 {
  return count === 4 ? 2 : 3;
}

export function cardColors(primaryColor?: string | null): CardColors | null {
  if (!primaryColor || !hexColorSchema.safeParse(primaryColor).success) return null;
  const background = primaryColor.toUpperCase();
  const { color, ratio } = pickTextColor(background);
  return {
    background,
    text: color,
    ratio,
    // Inner panels (gallery items, flow steps) are a light tint; text on them always uses deep forest.
    surface: tint(background, 0.88),
    rule: color === "#FFFFFF" ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.35)",
  };
}

type MediaInput = { url: string; alt: string; width?: number; height?: number; kind?: MediaKind; fit?: "cover" | "contain"; poster?: string };

export function mediaView(media: MediaInput, fallback?: string): CardMediaView {
  return { url: media.url, alt: media.alt, aspectRatio: aspectRatioFor(media, fallback), kind: mediaKind(media.url, media.kind), fit: media.fit, poster: media.poster };
}

export function screenRatio(): string {
  return DEFAULT_SCREEN_RATIO;
}

export function buildCardView(project: CardProjectInput, index: number): CardView {
  const card = normalizeCard(project);
  const payloadFacts = "facts" in card.payload && card.payload.facts?.length ? card.payload.facts : null;
  const facts = payloadFacts ?? [
    project.role ? { label: "Role", value: project.role } : null,
    project.platform ? { label: "Platform", value: project.platform } : null,
    project.status ? { label: "Status", value: project.status } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
  return {
    id: project.id,
    template: card.template,
    fallback: card.fallback,
    href: `/work/${project.slug}`,
    label: `${String(index + 1).padStart(2, "0")} / ${project.category}`,
    title: project.title,
    summary: project.recruiterSummary || project.description,
    facts,
    cta: ("ctaLabel" in card.payload && card.payload.ctaLabel) || "Read the case study",
    colors: cardColors(project.primaryColor || DEFAULT_CARD_PALETTE[index % DEFAULT_CARD_PALETTE.length]),
    card,
  };
}

export type FactIcon = "role" | "platform" | "status" | "stack" | "scope" | "year" | "client" | "duration" | "info";

/** Icon for a card fact, chosen from its label (owner request: icons instead of visible labels). */
export function factIcon(label: string): FactIcon {
  const key = label.trim().toLowerCase();
  if (/^role|responsib/.test(key)) return "role";
  if (/^platform|device/.test(key)) return "platform";
  if (/^status|stage/.test(key)) return "status";
  if (/^stack|tools?$|tech/.test(key)) return "stack";
  if (/^scope|focus/.test(key)) return "scope";
  if (/^year|date|when/.test(key)) return "year";
  if (/^client|company|team/.test(key)) return "client";
  if (/^duration|timeline|length/.test(key)) return "duration";
  return "info";
}
