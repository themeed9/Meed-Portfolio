import type { z } from "zod";
import {
  beyondSchema, brandPageSchema, homeAboutSchema, homeContactSchema, homeDefaults, homeHeroSchema,
  homeStripSchema, moreWorkSchema, safeHref, siteFooterSchema,
} from "./home-content.ts";
import { isAllowedMediaUrl } from "./case-study-blocks.ts";

// Admin → Content (owner request, 2026-11-25): every homepage section is edited through a form that
// mirrors the live page, with text and image/GIF/video fields, never raw JSON. Pure, so the field
// specs and checks are unit-tested.

export type HomeField =
  | { key: string; label: string; kind: "text" | "textarea" | "link" | "email"; required?: boolean; help?: string }
  | { key: string; label: string; kind: "media"; help?: string; imageOnly?: boolean; defaultFit?: "cover" | "contain" }
  | { key: string; label: string; kind: "group"; fields: HomeField[]; help?: string }
  | { key: string; label: string; kind: "list"; itemLabel: string; fields: HomeField[]; max: number; help?: string }
  | { key: string; label: string; kind: "projects"; help?: string };

export type HomeSection = {
  key: string;
  title: string;
  description: string;
  schema: z.ZodType<unknown>;
  fallback: unknown;
  fields: HomeField[];
};

const req = (key: string, label: string, kind: "text" | "textarea" | "link" = "text", help?: string): HomeField => ({ key, label, kind, required: true, help });
const opt = (key: string, label: string, kind: "text" | "textarea" | "link" | "email" = "text", help?: string): HomeField => ({ key, label, kind, help });

/** Homepage sections in live-page order, then the brand page. */
export const homeSections: HomeSection[] = [
  {
    key: "home-hero", title: "Hero", description: "The top of the homepage, over the sky.",
    schema: homeHeroSchema, fallback: homeDefaults.hero,
    fields: [
      req("status", "Status line", "text", "Small line above the headline, e.g. your role and city."),
      req("headline", "Headline", "textarea"),
      req("intro", "Intro", "textarea"),
      req("ctaText", "Button text"),
      req("ctaLink", "Button link", "link", "A page (/work), a section (#selected-work) or a full https:// link."),
      opt("rolesText", "Line under the button"),
      opt("rolesLink", "Link for that line", "link"),
      { key: "image", label: "Hero image or video", kind: "media", defaultFit: "contain", help: "Shown on the right. Leave empty to use your first featured project's image." },
      { key: "background", label: "Background photo", kind: "media", imageOnly: true, help: "The sky photo behind the header, hero and carousel. Leave empty for the default sky." },
    ],
  },
  {
    key: "home-strip", title: "Project carousel", description: "The auto-scrolling row under the hero. Your published projects appear first, using the homepage image set in Projects.",
    schema: homeStripSchema, fallback: homeDefaults.strip,
    fields: [
      { key: "hiddenProjects", label: "Projects to leave out of the carousel", kind: "projects" },
      {
        key: "placeholders", label: "Extra tiles", kind: "list", itemLabel: "tile", max: 12,
        help: "Shown after your projects: coming-soon work, side projects or external links.",
        fields: [
          req("title", "Title"),
          req("note", "Small note", "text", "e.g. Coming soon, In progress, Live site."),
          opt("href", "Link (optional)", "link", "Leave empty for a tile that isn't clickable."),
          { key: "media", label: "Tile image or video", kind: "media", help: "Leave empty to show a simple wireframe." },
        ],
      },
    ],
  },
  {
    key: "home-more-work", title: "More work", description: "The list of smaller projects under Selected work.",
    schema: moreWorkSchema, fallback: homeDefaults.moreWork,
    fields: [
      req("label", "Section label"),
      {
        key: "items", label: "Items", kind: "list", itemLabel: "item", max: 12,
        fields: [req("title", "Title"), req("description", "Short description"), opt("href", "Link (optional)", "link"), { key: "media", label: "Thumbnail (optional)", kind: "media" }],
      },
    ],
  },
  {
    key: "home-about", title: "About", description: "Your statement and photo.",
    schema: homeAboutSchema, fallback: homeDefaults.about,
    fields: [req("label", "Section label"), req("statement", "Statement", "textarea"), { key: "image", label: "Photo or video", kind: "media" }],
  },
  {
    key: "home-beyond", title: "Beyond product design", description: "Three rows: your animation project, your brand, and brand and graphic work.",
    schema: beyondSchema, fallback: homeDefaults.beyond,
    fields: [
      req("label", "Section label"),
      { key: "ai", label: "Row 1: animation project", kind: "group", fields: [req("label", "Small label"), req("title", "Title"), req("body", "Description", "textarea"), { key: "media", label: "Episode video or image", kind: "media" }, req("videoCaption", "Text shown when there is no video")] },
      { key: "founder", label: "Row 2: founder", kind: "group", fields: [req("label", "Small label"), req("title", "Title"), req("body", "Description", "textarea"), opt("interests", "Second paragraph", "textarea"), { key: "media", label: "Image or video", kind: "media", help: "Shown on the right instead of the second paragraph, which then moves under the description." }] },
      { key: "brand", label: "Row 3: brand and graphic design", kind: "group", help: "The tiles in this row are the projects in the Brand collection (Projects → Collection: Brand).", fields: [req("label", "Small label"), req("title", "Title"), req("body", "Description", "textarea"), req("linkText", "Link text")] },
    ],
  },
  {
    key: "home-contact", title: "Contact", description: "The dark band at the bottom of the homepage.",
    schema: homeContactSchema, fallback: homeDefaults.contact,
    fields: [req("headline", "Headline"), opt("email", "Email", "email", "The contact email in Settings takes priority if set."), opt("githubUrl", "GitHub link", "link"), opt("resumeUrl", "Résumé link", "link")],
  },
  {
    key: "site-footer", title: "Footer", description: "The line at the very bottom of every page.",
    schema: siteFooterSchema, fallback: homeDefaults.footer,
    fields: [req("copyrightName", "Name after ©"), opt("version", "Version note")],
  },
  {
    key: "brand-page", title: "Brand page", description: "The Brand and graphic design page (/brand).",
    schema: brandPageSchema, fallback: homeDefaults.brandPage,
    fields: [req("backText", "Back link text"), req("label", "Label"), req("title", "Title"), req("intro", "Intro", "textarea"), req("emptyText", "Text when there are no brand projects", "textarea")],
  },
];

export const homeSectionByKey = (key: string) => homeSections.find((section) => section.key === key);

/** The value to show in the editor: the stored value if valid, else the live default. */
export function editableValue(section: HomeSection, stored: unknown): Record<string, unknown> {
  const parsed = stored === null || stored === undefined ? null : section.schema.safeParse(stored);
  const value = structuredClone((parsed?.success ? parsed.data : section.fallback) as Record<string, unknown>);
  // Older Beyond values kept the episode as a bare videoUrl; show it in the media field.
  if (section.key === "home-beyond") {
    const ai = value.ai as Record<string, unknown> | undefined;
    if (ai && !ai.media && typeof ai.videoUrl === "string" && ai.videoUrl) ai.media = { src: ai.videoUrl, alt: `${ai.title ?? "Episode"} video`, kind: "video" };
    if (ai) delete ai.videoUrl;
  }
  return value;
}

const isObj = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");
/** A form row the editor left completely empty (all text blank, no media). */
const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === "string" && !value.trim()) ||
  (Array.isArray(value) && value.every(isBlank)) || (isObj(value) && Object.values(value).every(isBlank));

function cleanMedia(value: unknown, imageOnly?: boolean): Record<string, string> | undefined {
  if (!isObj(value)) return undefined;
  const src = trim(value.src);
  if (!src) return undefined;
  const out: Record<string, string> = { src, alt: trim(value.alt) };
  if (!imageOnly) {
    const kind = trim(value.kind);
    const poster = trim(value.poster);
    const fit = trim(value.fit);
    if (kind === "image" || kind === "gif" || kind === "video") out.kind = kind;
    if (poster) out.poster = poster;
    if (fit === "cover" || fit === "contain") out.fit = fit;
  }
  return out;
}

/** Tidy form values before saving: trim text, drop empty optional fields, media and list rows. */
export function cleanHomeValue(fields: HomeField[], raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const value = raw[field.key];
    if (field.kind === "media") { const media = cleanMedia(value, field.imageOnly); if (media) out[field.key] = media; }
    else if (field.kind === "group") out[field.key] = cleanHomeValue(field.fields, isObj(value) ? value : {});
    else if (field.kind === "list") {
      const rows = Array.isArray(value) ? value.filter(isObj).filter((row) => !isBlank(row)).map((row) => cleanHomeValue(field.fields, row)) : [];
      out[field.key] = rows;
    } else if (field.kind === "projects") {
      const slugs = Array.isArray(value) ? value.map(trim).filter(Boolean) : [];
      if (slugs.length) out[field.key] = [...new Set(slugs)];
    } else {
      const text = trim(value);
      if (text || field.required) out[field.key] = text;
    }
  }
  return out;
}

/** Turn a value path (["placeholders", 0, "href"]) into the labels the editor shows. */
function labelPath(fields: HomeField[], path: (string | number)[]): string {
  const out: string[] = [];
  let current: HomeField[] | undefined = fields;
  for (let i = 0; i < path.length; i++) {
    const part = path[i];
    const field: HomeField | undefined = current?.find((f) => f.key === String(part));
    if (!field) { out.push(String(part)); current = undefined; continue; }
    out.push(field.label);
    if (field.kind === "list") {
      const index = path[i + 1];
      if (typeof index === "number" || /^\d+$/.test(String(index))) { out.push(`${field.itemLabel} ${Number(index) + 1}`); i++; }
      current = field.fields;
    } else current = field.kind === "group" ? field.fields : undefined;
  }
  return out.join(" › ");
}

const LINK_KEYS = new Set(["ctaLink", "rolesLink", "href", "githubUrl", "resumeUrl"]);

/** Media and links must be ones the site can actually show and link to safely. */
function unsafeValue(value: unknown, path: string[] = []): { path: string[]; message: string } | null {
  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) { const found = unsafeValue(item, [...path, String(i)]); if (found) return found; }
    return null;
  }
  if (!isObj(value)) return null;
  if (typeof value.src === "string" && !isAllowedMediaUrl(value.src)) return { path, message: "use an uploaded file, a Cloudinary link or an Unsplash image link" };
  if (typeof value.poster === "string" && !isAllowedMediaUrl(value.poster)) return { path, message: "the video poster must be an uploaded file or a Cloudinary link" };
  for (const [key, item] of Object.entries(value)) {
    if (LINK_KEYS.has(key) && typeof item === "string" && !safeHref(item)) return { path: [...path, key], message: "links must start with /, #, https:// or mailto:" };
    const found = unsafeValue(item, [...path, key]);
    if (found) return found;
  }
  return null;
}

export type HomeCheck = { ok: true; value: unknown } | { ok: false; error: string };

/** Validate a section before saving. Returns the parsed value to store. */
export function checkHomeSection(key: string, value: unknown): HomeCheck {
  const section = homeSectionByKey(key);
  if (!section) return { ok: false, error: "Unknown section" };
  const parsed = section.schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue.path.length ? labelPath(section.fields, issue.path as (string | number)[]) : section.title;
    const message = issue.code === "too_small" ? "is required" : issue.message;
    return { ok: false, error: `${section.title}: ${where} ${message}` };
  }
  const unsafe = unsafeValue(parsed.data);
  if (unsafe) return { ok: false, error: `${section.title}: ${labelPath(section.fields, unsafe.path)}: ${unsafe.message}` };
  return { ok: true, value: parsed.data };
}
