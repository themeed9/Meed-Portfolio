import { z } from "zod";

// Typed homepage project cards (ADR-010), modelled on lib/case-study.ts (ADR-003):
// each template has a Zod payload schema, and invalid or missing payloads fall back
// to `media_split` built from the project's existing cover image.

export const cardTemplates = ["media_split", "device_stage", "gallery_grid", "process_flow", "statement"] as const;
export type CardTemplate = (typeof cardTemplates)[number];

export const projectCollections = ["product", "brand"] as const;
export type ProjectCollection = (typeof projectCollections)[number];

export const imageRoles = ["cover", "screen", "detail"] as const;
export type ImageRole = (typeof imageRoles)[number];

export const hexColorSchema = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour such as #1872F5");

const cardMediaSchema = z.object({
  url: z.string().min(1),
  alt: z.string().trim().min(1).max(300),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const factSchema = z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(160) });

// Shared, optional slots available to every template.
const sharedSlots = {
  facts: z.array(factSchema).max(4).optional(),
  ctaLabel: z.string().trim().min(1).max(40).optional(),
};

// Figures on a card are design targets or hypotheses, never results
// (docs/product/content-architecture.md; ADR-010 conflict C4).
const targetSchema = z.object({ value: z.string().trim().min(1).max(16), caption: z.string().trim().min(1).max(120) });

export const cardPayloadSchemas = {
  media_split: z.object({ ...sharedSlots, image: cardMediaSchema.optional() }),
  device_stage: z.object({ ...sharedSlots, screens: z.array(cardMediaSchema).min(1).max(3), targets: z.array(targetSchema).max(3).optional() }),
  gallery_grid: z.object({ ...sharedSlots, items: z.array(cardMediaSchema).min(3).max(9), labels: z.array(z.string().trim().min(1).max(60)).max(4).optional() }),
  process_flow: z.object({ ...sharedSlots, steps: z.array(z.object({ name: z.string().trim().min(1).max(40), media: cardMediaSchema.optional() })).min(3).max(6) }),
  statement: z.object({ ...sharedSlots, statement: z.string().trim().min(1).max(200), image: cardMediaSchema.optional() }),
} satisfies Record<CardTemplate, z.ZodType>;

export type CardPayload<T extends CardTemplate = CardTemplate> = z.infer<(typeof cardPayloadSchemas)[T]>;

export type ProjectCardRecord = {
  title: string;
  cardTemplate?: string | null;
  cardPayload?: unknown;
  coverImage?: string | null;
  homepageImage?: string | null;
};

export type NormalizedCard =
  | { [T in CardTemplate]: { template: T; payload: CardPayload<T>; fallback: boolean } }[CardTemplate];

export function isCardTemplate(value: unknown): value is CardTemplate {
  return cardTemplates.includes(value as CardTemplate);
}

export function normalizeCard(project: ProjectCardRecord): NormalizedCard {
  if (isCardTemplate(project.cardTemplate)) {
    const parsed = cardPayloadSchemas[project.cardTemplate].safeParse(project.cardPayload ?? {});
    if (parsed.success) return { template: project.cardTemplate, payload: parsed.data, fallback: false } as NormalizedCard;
  }
  const url = project.homepageImage || project.coverImage;
  return {
    template: "media_split",
    payload: url ? { image: { url, alt: `${project.title} preview` } } : {},
    fallback: true,
  };
}

// ---- Colour helpers (WCAG 2.x relative luminance and contrast) ----

export const TEXT_ON_COLOR_CANDIDATES = ["#FFFFFF", "#07100B", "#000000"] as const;
export const MIN_TEXT_CONTRAST = 4.5;

function channels(hex: string): [number, number, number] {
  const value = hexColorSchema.parse(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** First of white, near-black or black that reaches 4.5:1. Black or white always can. */
export function pickTextColor(background: string): { color: string; ratio: number } {
  for (const color of TEXT_ON_COLOR_CANDIDATES) {
    const ratio = contrastRatio(background, color);
    if (ratio >= MIN_TEXT_CONTRAST) return { color, ratio };
  }
  // Unreachable for valid hex (max(white, black) >= ~4.58), kept as a safe default.
  const ratio = contrastRatio(background, "#000000");
  return { color: "#000000", ratio };
}

/** Lighter shade for inner surfaces: mixes the colour towards white by `amount` (0–1). */
export function tint(hex: string, amount: number): string {
  const t = Math.min(1, Math.max(0, amount));
  return `#${channels(hex).map((c) => Math.round(c + (255 - c) * t).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
