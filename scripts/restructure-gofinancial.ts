/**
 * One-off: restructure the GoFinancial case study into the 2-minute recruiter brief (owner request,
 * 2026-11-25; ADR-011 addendum). Nothing is deleted.
 *
 *   npx tsx scripts/restructure-gofinancial.ts           preview only (default, writes nothing)
 *   npx tsx scripts/restructure-gofinancial.ts --apply   apply in one transaction
 *   npx tsx scripts/restructure-gofinancial.ts --undo    remove the new blocks and show the old ones again
 *
 * Apply: hides every current block (marked so undo can restore it), keeps the legacy Overview and
 * Challenge text as hidden blocks, and adds five new blocks at the top: Summary, Problem, Key
 * decisions, What shipped, Outcome. Screens already in the case study are reused automatically.
 * Running --apply twice is refused. Undo works until the new blocks are edited in the admin
 * (saving a block there drops the restructure marker).
 *
 * Needs DATABASE_URL for the target database. Run the preview first.
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.ts";
import { caseStudyLength, checkBlock, isAllowedMediaUrl, readBlockSettings, type BlockMedia } from "../lib/case-study-blocks.ts";
import type { CaseStudySectionType } from "../lib/case-study.ts";

const SLUG = process.argv.find((arg) => arg.startsWith("--slug="))?.slice(7) ?? "gofinancial";
const MARKER = "recruiter-brief-2026-11";
const mode = process.argv.includes("--undo") ? "undo" : process.argv.includes("--apply") ? "apply" : "preview";

type Section = { id: string; type: string; title: string | null; eyebrow: string | null; content: string; payload: unknown; metadata: unknown; imageUrl: string | null; imageAlt: string | null; order: number };
type NewBlock = { type: CaseStudySectionType; eyebrow: string; title: string; content: string; payload: Record<string, unknown> | null; media: BlockMedia[] };

const meta = (value: unknown): Record<string, unknown> => (value && typeof value === "object" && !Array.isArray(value) ? { ...(value as Record<string, unknown>) } : {});
const json = (value: unknown) => value as Prisma.InputJsonValue;

/** Media found in a block: its own media, typed-field media and the legacy single image. */
function mediaOf(section: Section): BlockMedia[] {
  const out: BlockMedia[] = [...readBlockSettings(section.metadata, { url: section.imageUrl, alt: section.imageAlt }).media];
  const payload = meta(section.payload);
  const push = (item: unknown) => {
    const m = meta(item);
    if (typeof m.url === "string" && isAllowedMediaUrl(m.url)) out.push({ url: m.url, alt: typeof m.alt === "string" && m.alt.trim() ? m.alt : section.title ?? "GoFinancial screen", ...(typeof m.caption === "string" && m.caption ? { caption: m.caption } : {}) });
  };
  if (Array.isArray(payload.media)) payload.media.forEach(push);
  push(payload.beforeMedia);
  push(payload.afterMedia);
  return out;
}

const find = (sections: Section[], words: string) => sections.find((s) => `${s.eyebrow ?? ""} ${s.title ?? ""}`.toLowerCase().includes(words));

async function main() {
  const project = await prisma.project.findUnique({
    where: { slug: SLUG },
    include: { caseStudySections: { orderBy: { order: "asc" } }, images: { orderBy: { order: "asc" } } },
  });
  if (!project) throw new Error(`No project with slug "${SLUG}".`);
  const sections = project.caseStudySections as Section[];
  const ours = sections.filter((s) => meta(s.metadata).restructure === MARKER);
  const hiddenByUs = sections.filter((s) => meta(s.metadata).hiddenBy === MARKER);

  if (mode === "undo") {
    if (!ours.length && !hiddenByUs.length) { console.log("Nothing to undo: the restructure is not applied."); return; }
    await prisma.$transaction([
      prisma.caseStudySection.deleteMany({ where: { id: { in: ours.map((s) => s.id) } } }),
      ...hiddenByUs.map((s) => {
        const { wasHidden, ...rest } = meta(s.metadata);
        delete rest.hiddenBy;
        return prisma.caseStudySection.update({ where: { id: s.id }, data: { metadata: json({ ...rest, hidden: wasHidden === true }), order: Math.max(0, s.order - ours.length) } });
      }),
    ]);
    console.log(`Undone: removed ${ours.length} new block(s) and restored ${hiddenByUs.length} block(s) to how they were.`);
    return;
  }
  if (ours.length) { console.log("Already applied. Run with --undo first if you want to apply it again."); return; }

  // Screens to reuse, most specific first.
  const decisionScreens = mediaOf(find(sections, "primary interaction") ?? find(sections, "capture and awareness") ?? ({} as Section)).slice(0, 2);
  const shippedScreens = mediaOf(find(sections, "information hierarchy") ?? find(sections, "daily, weekly") ?? ({} as Section));
  const pool: BlockMedia[] = [];
  const seen = new Set<string>();
  const add = (m: BlockMedia) => { if (!seen.has(m.url) && isAllowedMediaUrl(m.url)) { seen.add(m.url); pool.push(m); } };
  [...decisionScreens, ...shippedScreens].forEach((m) => seen.add(m.url));
  const hero = project.heroImage || project.coverImage || project.homepageImage;
  const summaryMedia: BlockMedia[] = hero && isAllowedMediaUrl(hero) && !seen.has(hero) ? [{ url: hero, alt: "GoFinancial app screens" }] : [];
  summaryMedia.forEach((m) => seen.add(m.url));
  sections.flatMap(mediaOf).forEach(add);
  project.images.forEach((image) => add({ url: image.url, alt: image.alt || "GoFinancial screen", ...(image.caption ? { caption: image.caption } : {}) }));
  const take = () => pool.shift();

  const withCaption = (list: BlockMedia[], captions: string[]) => list.map((m, i) => (captions[i] ? { ...m, caption: captions[i] } : m));
  const problemImage = take();
  const outcomeImage = take();
  const galleryItems = [...withCaption(shippedScreens, ["Each entry feeds weekly and category context."]), ...pool.splice(0, 2)];

  const blocks: NewBlock[] = [
    {
      type: "project_tldr", eyebrow: "Summary", title: "An expense tracker built around one simple habit.", content: "",
      payload: {
        problem: "Cash purchases logged late were easy to forget.",
        hypothesis: "If logging takes seconds, people record spending while they still remember it.",
        role: "Product designer and product lead",
        platform: "Offline-first web PWA",
        status: "Live V1, paused for a narrower redesign",
        contribution: "Defined the product rules, designed the core loop, and directed and reviewed AI-assisted implementation.",
      },
      media: summaryMedia,
    },
    {
      type: "problem_statement", eyebrow: "Problem", title: "I could remember spending money, or remember to record it, but not both.", content: "",
      payload: { body: "I tracked spending in a notebook, and it only worked when I wrote things down straight away. After a few days, cash purchases were impossible to reconstruct. Banking apps showed card payments, not where the cash went. The gap wasn't data. It was everyday awareness." },
      media: problemImage ? [problemImage] : [],
    },
    {
      type: "rich_text", eyebrow: "Key decisions", title: "Three decisions that shaped the product.",
      content: [
        "- Awareness before automation. No bank sync in the MVP: it adds setup, trust and security work before the core idea is tested, and cash was the real gap.",
        "- Quick Add at the centre. The first build treated it as a secondary feature, so I made it persistent and visually dominant. Open, log, close.",
        "- Categories stay required. One extra tap turns single entries into weekly and monthly context.",
      ].join("\n"),
      payload: null,
      media: withCaption(decisionScreens, ["Amount and category in one focused step.", "Saving updates the daily total immediately."]),
    },
    galleryItems.length
      ? { type: "gallery", eyebrow: "The product", title: "What shipped.", content: "V1 is a working offline-first PWA: quick entry, daily total, history, weekly and category views, multi-currency, CSV export and offline storage.", payload: { media: galleryItems }, media: [] }
      : { type: "rich_text", eyebrow: "The product", title: "What shipped.", content: "V1 is a working offline-first PWA: quick entry, daily total, history, weekly and category views, multi-currency, CSV export and offline storage.", payload: null, media: [] },
    {
      type: "outcome", eyebrow: "Outcome", title: "What it proved, and what I'd do differently.", content: "",
      payload: {
        result: "V1 proved the concept can be built. It hasn't yet proved people keep using it.",
        evidence: "I added too much too early. Budgets, currencies, export and themes arrived before repeat usage showed what deserved to stay.",
        caveat: "Next, I'd restart from the core loop, test repeat usage first, and add proper sign-in and data ownership before a wider release.",
      },
      media: outcomeImage ? [outcomeImage] : [],
    },
  ];

  // Same checks as the admin: every block must be complete and its media allowed.
  for (const block of blocks) {
    const check = checkBlock(block.type, block.payload, { media: block.media, mediaLayout: "auto", hidden: false });
    if (!check.ok) throw new Error(`"${block.title}": ${check.error}`);
  }

  const legacyNeeded = (["overview", "challenge"] as const).filter((field) => project[field]?.trim() && !sections.some((s) => meta(s.metadata).legacy === field));
  const visibleBefore = sections.filter((s) => !readBlockSettings(s.metadata).hidden);
  const after = caseStudyLength(blocks.map((b) => ({ type: b.type, title: b.title, content: b.content, payload: b.payload, metadata: { media: b.media } })), { description: project.description });
  const before = caseStudyLength(sections, { description: project.description, overview: project.overview, challenge: project.challenge });

  console.log(`GoFinancial (${SLUG}) — ${mode === "apply" ? "APPLYING" : "PREVIEW, nothing written"}`);
  console.log(`  Reading time: ${before.minutes} min (${before.words} words) -> ${after.minutes} min (${after.words} words)`);
  console.log(`  Hide ${visibleBefore.length} current block(s); keep ${legacyNeeded.length} legacy field(s) as hidden blocks: ${legacyNeeded.join(", ") || "none"}`);
  for (const [i, b] of blocks.entries()) console.log(`  + ${i + 1}. ${b.type.padEnd(18)} ${b.title}  [${b.media.length + (Array.isArray(b.payload?.media) ? (b.payload!.media as unknown[]).length : 0)} image(s)${b.media.length || b.type === "gallery" ? "" : ", tinted panel"}]`);
  if (mode !== "apply") { console.log("\nRun again with --apply to write these changes."); return; }

  await prisma.$transaction(async (tx) => {
    const shift = blocks.length + legacyNeeded.length;
    for (const s of sections) {
      const m = meta(s.metadata);
      await tx.caseStudySection.update({ where: { id: s.id }, data: { order: s.order + shift, metadata: json({ ...m, wasHidden: m.hidden === true, hidden: true, hiddenBy: MARKER }) } });
    }
    for (const [i, b] of blocks.entries()) {
      await tx.caseStudySection.create({ data: {
        projectId: project.id, type: b.type, eyebrow: b.eyebrow, title: b.title, content: b.content, order: i,
        payload: b.payload === null ? undefined : json(b.payload),
        metadata: json({ media: b.media, mediaLayout: "auto", width: "default", background: "plain", hidden: false, showInContents: true, restructure: MARKER }),
      } });
    }
    for (const [i, field] of legacyNeeded.entries()) {
      await tx.caseStudySection.create({ data: {
        projectId: project.id, type: "rich_text", eyebrow: field === "overview" ? "Overview" : "The tension",
        title: field === "overview" ? "The product in context." : "The product challenge.", content: project[field] ?? "", order: blocks.length + i,
        metadata: json({ hidden: true, legacy: field, restructure: MARKER }),
      } });
    }
  });
  console.log("\nApplied. Check it in the admin: Preview case study. To revert: --undo");
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
