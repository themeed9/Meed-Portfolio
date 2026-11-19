import { z } from "zod";
import { caseStudySectionTypes, payloadSchemaFor, type CaseStudySectionType } from "./case-study.ts";
import { mediaKind, mediaKinds } from "./project-card.ts";

// Case-study CMS layer on top of the typed blocks (ADR-003, extended by ADR-011):
// - every block can carry its own media (images, GIFs, videos) or be text only;
// - per-block presentation settings (media layout, width, background, visibility);
// - form field specs so the admin edits each block type with real fields, never raw JSON;
// - starter templates and conversion of the legacy Overview/Challenge text into blocks.
// Settings live in the existing CaseStudySection.metadata JSON column, so no migration is needed.

// ---------------------------------------------------------------------------------------------
// Block media and settings

/** Same hosts the Content-Security-Policy and next/image allow; anything else would not load. */
export function isAllowedMediaUrl(url: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  return /^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com)\//.test(url);
}

export const blockMediaSchema = z.object({
  url: z.string().trim().min(1, "Add an image, GIF or video").max(2000).refine(isAllowedMediaUrl, "Use an uploaded file, a Cloudinary link or an Unsplash image link"),
  alt: z.string().trim().min(1, "Describe the media for screen readers (alt text)").max(300),
  caption: z.string().trim().max(300).optional(),
  kind: z.enum(mediaKinds).optional(),
  fit: z.enum(["contain", "cover"]).optional(),
  poster: z.string().trim().max(2000).refine(isAllowedMediaUrl, "Poster must be an uploaded file or a Cloudinary link").optional(),
});
export type BlockMedia = z.infer<typeof blockMediaSchema>;

export const mediaLayouts = ["below", "above", "left", "right", "grid"] as const;
export const blockWidths = ["default", "text", "wide", "full"] as const;
export const blockBackgrounds = ["plain", "tint", "brand"] as const;
export const legacyFields = ["overview", "challenge", "approach", "results", "testimonial"] as const;
export type MediaLayout = (typeof mediaLayouts)[number];
export type BlockWidth = (typeof blockWidths)[number];
export type BlockBackground = (typeof blockBackgrounds)[number];
export type LegacyField = (typeof legacyFields)[number];

export const blockSettingsSchema = z.object({
  media: z.array(blockMediaSchema).max(12, "Up to 12 media items per block").default([]),
  mediaLayout: z.enum(mediaLayouts).default("below"),
  width: z.enum(blockWidths).default("default"),
  background: z.enum(blockBackgrounds).default("plain"),
  hidden: z.boolean().default(false),
  showInContents: z.boolean().default(true),
  legacy: z.enum(legacyFields).optional(),
});
export type BlockSettings = z.infer<typeof blockSettingsSchema>;

export const DEFAULT_SETTINGS: BlockSettings = blockSettingsSchema.parse({});

export const MEDIA_LAYOUT_LABELS: Record<MediaLayout, string> = {
  below: "Below the text",
  above: "Above the text",
  left: "Beside the text, on the left",
  right: "Beside the text, on the right",
  grid: "Grid below the text",
};
export const WIDTH_LABELS: Record<BlockWidth, string> = {
  default: "Default for this block",
  text: "Text column",
  wide: "Wide",
  full: "Full screen width",
};
export const BACKGROUND_LABELS: Record<BlockBackground, string> = {
  plain: "Plain",
  tint: "Soft tint",
  brand: "Project colour",
};

/**
 * Settings for rendering: invalid or missing metadata falls back to safe defaults, and the legacy
 * single image (imageUrl / imageAlt) becomes the block's first media item.
 */
export function readBlockSettings(metadata: unknown, legacyImage?: { url?: string | null; alt?: string | null }): BlockSettings {
  const raw = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  const parsed = blockSettingsSchema.safeParse(raw);
  let settings: BlockSettings;
  if (parsed.success) settings = parsed.data;
  else {
    // Keep each valid setting; drop only the broken ones (e.g. one bad media item).
    const pick = <T>(schema: z.ZodType<T>, value: unknown, fallback: T): T => { const one = schema.safeParse(value); return one.success ? one.data : fallback; };
    const media = Array.isArray(raw.media) ? raw.media.flatMap((item) => { const one = blockMediaSchema.safeParse(item); return one.success ? [one.data] : []; }).slice(0, 12) : [];
    settings = {
      media,
      mediaLayout: pick(z.enum(mediaLayouts), raw.mediaLayout, DEFAULT_SETTINGS.mediaLayout),
      width: pick(z.enum(blockWidths), raw.width, DEFAULT_SETTINGS.width),
      background: pick(z.enum(blockBackgrounds), raw.background, DEFAULT_SETTINGS.background),
      hidden: pick(z.boolean(), raw.hidden, false),
      showInContents: pick(z.boolean(), raw.showInContents, true),
      legacy: pick(z.enum(legacyFields).optional(), raw.legacy, undefined),
    };
  }
  if (!settings.media.length && legacyImage?.url && isAllowedMediaUrl(legacyImage.url)) {
    settings = { ...settings, media: [{ url: legacyImage.url, alt: legacyImage.alt || "Case study image" }] };
  }
  return settings;
}

/** Media with its kind resolved from the URL when not set explicitly. */
export function resolvedKind(media: Pick<BlockMedia, "url" | "kind">) {
  return mediaKind(media.url, media.kind);
}

// ---------------------------------------------------------------------------------------------
// Validation used by the API

const firstIssue = (error: z.ZodError, prefix: string) => {
  const issue = error.issues[0];
  if (issue.path[0] === "media" && typeof issue.path[1] === "number") return `Image ${issue.path[1] + 1}: ${issue.message}`;
  const path = issue.path.length ? ` (${issue.path.join(".")})` : "";
  return `${prefix}${path}: ${issue.message}`;
};

const filledText = (value: unknown) => typeof value === "string" && value.trim().length > 0;
const filledMedia = (value: unknown) => Boolean(value && typeof value === "object" && filledText((value as Record<string, unknown>).url) && filledText((value as Record<string, unknown>).alt));

/** The first required field left empty, as the editor labels it (the schemas alone accept ""). */
export function missingRequiredField(type: CaseStudySectionType, payload: unknown): string | null {
  const data = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  for (const field of TYPE_INFO[type].fields) {
    const value = data[field.key];
    if (field.kind === "text" || field.kind === "textarea") { if (field.required && !filledText(value)) return field.label; continue; }
    if (field.kind === "media") { if (field.required && !filledMedia(value)) return `${field.label} (image and alt text)`; continue; }
    const list = Array.isArray(value) ? value : [];
    const min = "min" in field && field.min ? field.min : field.required ? 1 : 0;
    if (field.kind === "mediaList") {
      if (list.length < min) return `${field.label} (at least ${min})`;
      if (list.some((item) => !filledMedia(item))) return `${field.label} (every item needs an image and alt text)`;
    } else if (field.kind === "strings") {
      if (list.filter(filledText).length < min) return `${field.label} (at least ${min})`;
    } else if (field.kind === "rows") {
      if (list.length < min) return `${field.label} (at least ${min})`;
      const required = field.fields.filter((sub) => sub.required);
      if (list.some((row) => required.some((sub) => !filledText((row as Record<string, unknown>)?.[sub.key])))) return `${field.label} (fill every ${field.itemLabel})`;
    }
  }
  return null;
}

export type BlockCheck = { ok: true; settings: BlockSettings | null } | { ok: false; error: string };

/**
 * A block must be complete to be public. Hidden blocks are drafts: their typed fields may still be
 * empty, but their settings and media are always validated.
 */
export function checkBlock(type: CaseStudySectionType, payload: unknown, metadata: unknown): BlockCheck {
  let settings: BlockSettings | null = null;
  if (metadata !== undefined && metadata !== null) {
    const parsed = blockSettingsSchema.safeParse(metadata);
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error, "Block settings") };
    settings = parsed.data;
  }
  if (type === "rich_text" || settings?.hidden) return { ok: true, settings };
  const schema = payloadSchemaFor(type);
  const missing = missingRequiredField(type, payload);
  if (missing) return { ok: false, error: `${TYPE_INFO[type].label}: fill in “${missing}”, or tick “Hide from the public page” to save it as a draft.` };
  const result = schema.safeParse(payload);
  if (!result.success) return { ok: false, error: `${firstIssue(result.error, TYPE_INFO[type].label)}. Fill the required fields, or hide the block to save it as a draft.` };
  return { ok: true, settings };
}

// ---------------------------------------------------------------------------------------------
// Admin form specs

export type FieldSpec =
  | { key: string; label: string; kind: "text"; required?: boolean; help?: string }
  | { key: string; label: string; kind: "textarea"; required?: boolean; help?: string }
  | { key: string; label: string; kind: "media"; required?: boolean; help?: string }
  | { key: string; label: string; kind: "mediaList"; required?: boolean; min?: number; help?: string }
  | { key: string; label: string; kind: "strings"; required?: boolean; min?: number; itemLabel: string; help?: string }
  | { key: string; label: string; kind: "rows"; required?: boolean; min?: number; itemLabel: string; fields: { key: string; label: string; kind: "text" | "textarea"; required?: boolean }[]; help?: string };

const visualFields: FieldSpec[] = [
  { key: "media", label: "Screens", kind: "mediaList", required: true, min: 1, help: "The screens or diagrams this block is about." },
  { key: "note", label: "Note", kind: "textarea" },
  { key: "annotations", label: "Callouts", kind: "rows", itemLabel: "callout", fields: [
    { key: "number", label: "Number", kind: "text", required: true },
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "detail", label: "Detail", kind: "textarea", required: true },
  ], help: "Optional numbered notes shown beside the screens." },
];

export const TYPE_INFO: Record<CaseStudySectionType, { label: string; description: string; fields: FieldSpec[]; textLabel: string }> = {
  project_tldr: { label: "Summary (TL;DR)", description: "The whole project in six short answers.", textLabel: "Intro text", fields: [
    { key: "problem", label: "Problem", kind: "textarea", required: true },
    { key: "hypothesis", label: "Hypothesis", kind: "textarea", required: true },
    { key: "role", label: "My role", kind: "text", required: true },
    { key: "platform", label: "Platform", kind: "text", required: true },
    { key: "status", label: "Status", kind: "text", required: true },
    { key: "contribution", label: "Contribution", kind: "textarea", required: true },
  ] },
  problem_statement: { label: "Problem statement", description: "The problem in a clear paragraph.", textLabel: "Intro text", fields: [
    { key: "body", label: "Problem statement", kind: "textarea", required: true },
  ] },
  product_principle: { label: "Design principle", description: "A principle that guided the work, set large.", textLabel: "Supporting text", fields: [
    { key: "principle", label: "Principle", kind: "text", required: true },
    { key: "rationale", label: "Why it matters", kind: "textarea", required: true },
  ] },
  decision: { label: "Design decision", description: "Context, the decision, why, and what it cost.", textLabel: "Intro text", fields: [
    { key: "context", label: "Context", kind: "textarea", required: true },
    { key: "decision", label: "Decision", kind: "textarea", required: true },
    { key: "rationale", label: "Why", kind: "textarea", required: true },
    { key: "tradeoff", label: "Trade-off", kind: "textarea", required: true },
    { key: "outcome", label: "Outcome", kind: "textarea" },
  ] },
  evidence: { label: "Research finding", description: "A finding, the evidence behind it and what it means.", textLabel: "Intro text", fields: [
    { key: "finding", label: "Finding", kind: "textarea", required: true },
    { key: "evidence", label: "Evidence", kind: "textarea", required: true },
    { key: "implication", label: "What it means", kind: "textarea" },
    { key: "media", label: "Evidence media", kind: "mediaList", help: "Optional screenshots, charts or quotes." },
  ] },
  before_after: { label: "Before and after", description: "Two screens side by side with what changed.", textLabel: "Intro text", fields: [
    { key: "beforeMedia", label: "Before", kind: "media", required: true },
    { key: "afterMedia", label: "After", kind: "media", required: true },
    { key: "change", label: "What changed", kind: "textarea", required: true },
    { key: "significance", label: "Why it matters", kind: "textarea", required: true },
  ] },
  annotated_screen: { label: "Annotated screen", description: "Screens with numbered callouts.", textLabel: "Intro text", fields: visualFields },
  tradeoff: { label: "Trade-off", description: "Options compared, and the one you chose.", textLabel: "Intro text", fields: [
    { key: "options", label: "Options", kind: "rows", required: true, min: 2, itemLabel: "option", fields: [
      { key: "label", label: "Option", kind: "text", required: true },
      { key: "benefit", label: "Benefit", kind: "textarea", required: true },
      { key: "cost", label: "Cost", kind: "textarea", required: true },
    ] },
    { key: "decision", label: "Decision", kind: "textarea", required: true },
  ] },
  user_flow: { label: "User flow", description: "The journey, step by step.", textLabel: "Intro text", fields: visualFields },
  interaction_states: { label: "Interaction states", description: "Empty, loading, error and success states.", textLabel: "Intro text", fields: visualFields },
  architecture_diagram: { label: "System diagram", description: "How the product or data fits together.", textLabel: "Intro text", fields: visualFields },
  design_system: { label: "Design system", description: "Components, tokens and patterns.", textLabel: "Intro text", fields: visualFields },
  ai_collaboration: { label: "AI collaboration", description: "Where AI helped and where your judgement led.", textLabel: "Intro text", fields: [
    { key: "task", label: "Task", kind: "textarea", required: true },
    { key: "use", label: "How AI was used", kind: "textarea", required: true },
    { key: "judgment", label: "My judgement", kind: "textarea", required: true },
    { key: "outcome", label: "Outcome", kind: "textarea" },
  ] },
  timeline: { label: "Timeline", description: "Milestones in order.", textLabel: "Intro text", fields: [
    { key: "events", label: "Milestones", kind: "rows", required: true, min: 1, itemLabel: "milestone", fields: [
      { key: "period", label: "When", kind: "text", required: true },
      { key: "title", label: "Title", kind: "text", required: true },
      { key: "detail", label: "Detail", kind: "textarea", required: true },
    ] },
  ] },
  outcome: { label: "Outcome", description: "The result, the evidence and any caveat.", textLabel: "Intro text", fields: [
    { key: "result", label: "Result", kind: "textarea", required: true },
    { key: "evidence", label: "Evidence", kind: "textarea" },
    { key: "caveat", label: "Caveat", kind: "textarea" },
  ] },
  reflection: { label: "Reflection", description: "What you learned, set large.", textLabel: "Intro text", fields: [
    { key: "body", label: "Reflection", kind: "textarea", required: true },
  ] },
  next_steps: { label: "Next steps", description: "What comes next.", textLabel: "Intro text", fields: [
    { key: "items", label: "Next steps", kind: "strings", required: true, min: 1, itemLabel: "step" },
  ] },
  rich_text: { label: "Text", description: "Free text with optional images. Start a line with ## for a subheading or - for a point.", textLabel: "Text", fields: [] },
  gallery: { label: "Gallery", description: "A set of images, GIFs or videos.", textLabel: "Intro text", fields: [
    { key: "media", label: "Gallery items", kind: "mediaList", required: true, min: 1 },
  ] },
};

export const emptyMedia = () => ({ url: "", alt: "", caption: "" });

/** A blank payload for a block type, keeping any values from `previous` that the new type shares. */
export function emptyPayload(type: CaseStudySectionType, previous: Record<string, unknown> = {}): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of TYPE_INFO[type].fields) {
    const kept = previous[field.key];
    if (field.kind === "text" || field.kind === "textarea") out[field.key] = typeof kept === "string" ? kept : "";
    else if (field.kind === "media") out[field.key] = kept && typeof kept === "object" && !Array.isArray(kept) ? kept : emptyMedia();
    else if (field.kind === "mediaList") out[field.key] = Array.isArray(kept) ? kept : Array.from({ length: field.min ?? 0 }, emptyMedia);
    else if (field.kind === "strings") out[field.key] = Array.isArray(kept) ? kept : Array.from({ length: field.min ?? 1 }, () => "");
    else if (field.kind === "rows") out[field.key] = Array.isArray(kept) ? kept : Array.from({ length: field.min ?? 0 }, () => Object.fromEntries(field.fields.map((sub) => [sub.key, ""])));
  }
  return out;
}

const trimText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function cleanMedia(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of ["url", "alt", "caption", "kind", "fit", "poster"]) {
    const text = trimText(item[key]);
    if (text) out[key] = text;
  }
  if (!out.url && !out.alt) return null;
  return { ...out, url: out.url ?? "", alt: out.alt ?? "" };
}

/**
 * Tidy a payload from the form before saving: trim text, drop blank optional text, and drop media,
 * list and row entries that were left completely empty.
 */
export function cleanPayload(type: CaseStudySectionType, raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of TYPE_INFO[type].fields) {
    const value = raw[field.key];
    if (field.kind === "text" || field.kind === "textarea") {
      const text = trimText(value);
      if (text || field.required) out[field.key] = text;
    } else if (field.kind === "media") {
      const media = cleanMedia(value);
      if (media || field.required) out[field.key] = media ?? {};
    } else if (field.kind === "mediaList") {
      const list = Array.isArray(value) ? value.map(cleanMedia).filter((item): item is Record<string, string> => item !== null) : [];
      if (list.length || field.required) out[field.key] = list;
    } else if (field.kind === "strings") {
      const list = Array.isArray(value) ? value.map(trimText).filter(Boolean) : [];
      if (list.length || field.required) out[field.key] = list;
    } else if (field.kind === "rows") {
      const rows = Array.isArray(value)
        ? value.flatMap((row) => {
            if (!row || typeof row !== "object") return [];
            const cleaned = Object.fromEntries(field.fields.map((sub) => [sub.key, trimText((row as Record<string, unknown>)[sub.key])]));
            return Object.values(cleaned).some(Boolean) ? [cleaned] : [];
          })
        : [];
      if (rows.length || field.required) out[field.key] = rows;
    }
  }
  return out;
}

/** Block media from the form: drop rows left completely empty, trim the rest. */
export function cleanBlockMedia(list: unknown[]): BlockMedia[] {
  return list.map(cleanMedia).filter((item): item is Record<string, string> => item !== null) as BlockMedia[];
}

// ---------------------------------------------------------------------------------------------
// Templates and legacy conversion

export type NewBlock = { type: CaseStudySectionType; eyebrow: string | null; title: string | null; content: string; payload: Record<string, unknown> | null; metadata: Partial<BlockSettings> };

const draft = (type: CaseStudySectionType, eyebrow: string, title: string, content = ""): NewBlock => ({
  type, eyebrow, title, content,
  payload: type === "rich_text" ? null : emptyPayload(type),
  metadata: { hidden: true },
});

export const caseStudyTemplates = {
  product: {
    label: "Product case study",
    description: "Full story: summary, problem, research, flow, decisions, before and after, outcome, reflection.",
    blocks: [
      draft("project_tldr", "Summary", "The project at a glance"),
      draft("problem_statement", "Problem", "The problem"),
      draft("evidence", "Research", "What research showed"),
      draft("user_flow", "Flow", "The core journey"),
      draft("decision", "Decision", "A key design decision"),
      draft("before_after", "Iteration", "Before and after"),
      draft("outcome", "Outcome", "What changed"),
      draft("reflection", "Reflection", "What I learned"),
    ],
  },
  brand: {
    label: "Brand project",
    description: "Visual-first: intro, gallery, design system, reflection.",
    blocks: [
      draft("rich_text", "Brief", "The brief", "Describe the brand, the audience and the goal."),
      draft("gallery", "Identity", "The identity"),
      draft("design_system", "System", "Colour, type and components"),
      draft("reflection", "Reflection", "What I learned"),
    ],
  },
  short: {
    label: "Short case study",
    description: "Three blocks: problem, solution with screens, outcome.",
    blocks: [
      draft("problem_statement", "Problem", "The problem"),
      draft("rich_text", "Solution", "The solution", "Explain the solution, and add screens below."),
      draft("outcome", "Outcome", "The result"),
    ],
  },
} as const satisfies Record<string, { label: string; description: string; blocks: NewBlock[] }>;
export type CaseStudyTemplate = keyof typeof caseStudyTemplates;
export const isCaseStudyTemplate = (value: unknown): value is CaseStudyTemplate => typeof value === "string" && value in caseStudyTemplates;

type LegacyProject = Partial<Record<LegacyField, string | null>> & { testimonialAuthor?: string | null };

const LEGACY_BLOCKS: Record<LegacyField, { eyebrow: string; title: string; hidden: boolean }> = {
  // Overview and Challenge are already public, so they stay visible with the same headings.
  overview: { eyebrow: "Overview", title: "The product in context.", hidden: false },
  challenge: { eyebrow: "The tension", title: "The product challenge.", hidden: false },
  // These were never shown on the public page, so they arrive as hidden drafts to review first.
  approach: { eyebrow: "Approach", title: "How I approached it.", hidden: true },
  results: { eyebrow: "Results", title: "What changed.", hidden: true },
  testimonial: { eyebrow: "Testimonial", title: "What people said.", hidden: true },
};

/**
 * Blocks for the legacy text fields that have content and have not been converted yet. Nothing is
 * deleted: the legacy fields stay in the database, and the page stops rendering a legacy field only
 * once a block marked with it exists.
 */
export function legacyBlocks(project: LegacyProject, alreadyConverted: LegacyField[]): NewBlock[] {
  return legacyFields.flatMap((field) => {
    const text = project[field]?.trim();
    if (!text || alreadyConverted.includes(field)) return [];
    const info = LEGACY_BLOCKS[field];
    const content = field === "testimonial" && project.testimonialAuthor?.trim() ? `${text}\n\n— ${project.testimonialAuthor.trim()}` : text;
    return [{ type: "rich_text" as const, eyebrow: info.eyebrow, title: info.title, content, payload: null, metadata: { hidden: info.hidden, legacy: field } }];
  });
}

export function convertedLegacyFields(sections: { metadata?: unknown }[]): LegacyField[] {
  return sections.flatMap((section) => {
    const legacy = section.metadata && typeof section.metadata === "object" ? (section.metadata as Record<string, unknown>).legacy : undefined;
    return legacyFields.includes(legacy as LegacyField) ? [legacy as LegacyField] : [];
  });
}

// ---------------------------------------------------------------------------------------------
// Page extras

export type ContentsEntry = { id: string; label: string };

/** "On this page" entries: visible blocks with a title that are not opted out. */
export function contentsEntries(sections: { id: string; title: string | null; metadata?: unknown }[]): ContentsEntry[] {
  return sections.flatMap((section) => {
    const settings = readBlockSettings(section.metadata);
    const label = section.title?.trim().replace(/\.$/, "");
    return label && !settings.hidden && settings.showInContents ? [{ id: `section-${section.id}`, label }] : [];
  });
}

function wordsIn(value: unknown): number {
  if (typeof value === "string") return value.trim() ? value.trim().split(/\s+/).length : 0;
  if (Array.isArray(value)) return value.reduce((sum: number, item) => sum + wordsIn(item), 0);
  if (value && typeof value === "object") return Object.entries(value).reduce((sum, [key, item]) => (["url", "kind", "fit", "poster"].includes(key) ? sum : sum + wordsIn(item)), 0);
  return 0;
}

/** Whole minutes at 220 words a minute, plus a few seconds per image; never less than 1. */
export function readingMinutes(parts: unknown[], mediaCount = 0): number {
  const words = parts.reduce((sum: number, part) => sum + wordsIn(part), 0);
  return Math.max(1, Math.round(words / 220 + mediaCount * 0.1));
}

export const isSectionType = (value: unknown): value is CaseStudySectionType => caseStudySectionTypes.includes(value as CaseStudySectionType);
