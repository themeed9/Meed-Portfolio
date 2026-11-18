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

// ---- Editor helpers ----

/** Empty payload for a template, keeping shared slots (facts, CTA) when switching templates. */
export function cardSkeleton(template: CardTemplate, previous?: Record<string, unknown> | null): Record<string, unknown> {
  const shared: Record<string, unknown> = {};
  if (previous?.facts) shared.facts = previous.facts;
  if (previous?.ctaLabel) shared.ctaLabel = previous.ctaLabel;
  switch (template) {
    case "device_stage": return { ...shared, screens: [], targets: [] };
    case "gallery_grid": return { ...shared, items: [], labels: [] };
    case "process_flow": return { ...shared, steps: [{ name: "" }, { name: "" }, { name: "" }] };
    case "statement": return { ...shared, statement: "" };
    default: return { ...shared };
  }
}

const blank = (value: unknown) => typeof value !== "string" || value.trim() === "";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Removes rows the editor left empty (blank facts, targets, labels, media without a URL,
 * an unused CTA) so half-filled optional slots do not fail validation. Required slots
 * such as steps and statement are kept so their errors still show.
 */
export function cleanCardPayload(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "ctaLabel") { if (!blank(value)) out.ctaLabel = value; continue; }
    if ((key === "image") && isRecord(value)) { if (!blank(value.url)) out.image = value; continue; }
    if (!Array.isArray(value)) { out[key] = value; continue; }
    const rows = value.filter((row) => {
      if (key === "labels") return !blank(row);
      if (!isRecord(row)) return false;
      if (key === "facts") return !(blank(row.label) && blank(row.value));
      if (key === "targets") return !(blank(row.value) && blank(row.caption));
      if (key === "screens" || key === "items") return !blank(row.url);
      return true;
    }).map((row) => (key === "steps" && isRecord(row) && isRecord(row.media) && blank(row.media.url) ? { name: row.name } : row));
    const optional = key === "facts" || key === "targets" || key === "labels";
    if (rows.length || !optional) out[key] = rows;
  }
  return out;
}

// ---- Write-side resolution for the project API (create and update) ----

export type CardInput = {
  primaryColor?: string;
  cardTemplate?: CardTemplate;
  cardPayload?: unknown;
  collection?: ProjectCollection;
};

export type CardWriteData = {
  primaryColor?: string | null;
  cardTemplate?: CardTemplate;
  cardPayload?: unknown;
  collection?: ProjectCollection;
};

/**
 * Turns validated form input into fields for Prisma. `undefined` means "leave unchanged",
 * so older clients that never send card fields cannot wipe them. A non-null payload must
 * come with its template and pass that template's schema, so invalid card content is
 * rejected on save rather than silently falling back on the public site.
 */
export function resolveCardInput(input: CardInput): { ok: true; data: CardWriteData } | { ok: false; error: string } {
  const data: CardWriteData = {};
  if (input.primaryColor !== undefined) data.primaryColor = input.primaryColor === "" ? null : input.primaryColor.trim().toUpperCase();
  if (input.collection !== undefined) data.collection = input.collection;
  if (input.cardTemplate !== undefined) data.cardTemplate = input.cardTemplate;
  if (input.cardPayload !== undefined) {
    if (input.cardPayload === null) {
      data.cardPayload = null;
    } else {
      if (!input.cardTemplate) return { ok: false, error: "Choose a card template before adding card content." };
      const parsed = cardPayloadSchemas[input.cardTemplate].safeParse(input.cardPayload);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const where = issue?.path.length ? issue.path.join(".") : "card";
        return { ok: false, error: `Homepage card (${input.cardTemplate}): ${where} — ${issue?.message ?? "invalid"}` };
      }
      data.cardPayload = parsed.data;
    }
  }
  return { ok: true, data };
}

// ---- Colour helpers (WCAG 2.x relative luminance and contrast) ----

// Brand main text (deep forest) is preferred over near-black and black wherever it passes.
export const TEXT_ON_COLOR_CANDIDATES = ["#FFFFFF", "#0B3D2E", "#07100B", "#000000"] as const;
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

/** First of white, deep forest, near-black or black that reaches 4.5:1. Black or white always can. */
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
