"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { caseStudySectionTypes, type CaseStudySectionType } from "@/lib/case-study";
import {
  BACKGROUND_LABELS, BLOCK_WORD_GUIDE, MEDIA_LAYOUT_LABELS, READ_TIME_TARGET_MINUTES, TYPE_INFO, WORD_BUDGET, blockWords, caseStudyLength, WIDTH_LABELS, blockBackgrounds, blockWidths, caseStudyTemplates,
  checkBlock, cleanBlockMedia, payloadHasMedia, cleanPayload, convertedLegacyFields, emptyPayload, isSectionType, legacyBlocks, mediaLayouts, readBlockSettings,
  type BlockSettings, type CaseStudyTemplate, type LegacyField,
} from "@/lib/case-study-blocks";
import { MediaListControl, PayloadFields, TextControl, type MediaDraft } from "./case-study/BlockFields";

// Case-study block editor (ADR-003 blocks, ADR-011 CMS layer). Every block type is edited through
// real fields; every block can also carry its own images, GIFs or videos, or be text only.

export type EditableSection = { id: string; type: string; title: string | null; eyebrow: string | null; content: string; payload: unknown; metadata?: unknown; imageUrl?: string | null; imageAlt?: string | null; order: number };
type Settings = Omit<BlockSettings, "media">;
type Draft = { type: CaseStudySectionType; eyebrow: string; title: string; content: string; payload: Record<string, unknown>; media: MediaDraft[]; settings: Settings };
type LegacyText = Partial<Record<LegacyField, string | null>> & { testimonialAuthor?: string | null };

const select = "mt-1 block w-full rounded-md border border-border-default bg-bg-primary p-3 text-sm font-normal";
const iconButton = "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-sm hover:bg-bg-secondary disabled:opacity-40";

function toDraft(section: EditableSection): Draft {
  const type = isSectionType(section.type) ? section.type : "rich_text";
  const { media, ...settings } = readBlockSettings(section.metadata, { url: section.imageUrl, alt: section.imageAlt });
  const previous = section.payload && typeof section.payload === "object" ? (section.payload as Record<string, unknown>) : {};
  return { type, eyebrow: section.eyebrow ?? "", title: section.title ?? "", content: section.content, payload: emptyPayload(type, previous), media, settings };
}

const newDraft = (type: CaseStudySectionType): Draft => ({ type, eyebrow: "", title: "", content: "", payload: emptyPayload(type), media: [], settings: { ...readBlockSettings(null) } });

function toBody(draft: Draft) {
  const media = cleanBlockMedia(draft.media);
  const metadata = { ...draft.settings, media };
  const payload = draft.type === "rich_text" ? null : cleanPayload(draft.type, draft.payload);
  // The legacy single image now lives in metadata.media; clear it so it is not shown twice.
  return { type: draft.type, eyebrow: draft.eyebrow.trim() || null, title: draft.title.trim() || null, content: draft.content, payload, metadata, imageUrl: null, imageAlt: null };
}

async function readError(response: Response, fallback: string) {
  try { const data = await response.json(); return typeof data.error === "string" ? data.error : fallback; } catch { return fallback; }
}

export default function CaseStudySectionEditor({ projectId, initialSections, legacy = {}, description = "" }: { projectId: string; initialSections: EditableSection[]; legacy?: LegacyText; description?: string }) {
  const [sections, setSections] = useState(initialSections);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const legacyLeft = legacyBlocks(legacy, convertedLegacyFields(sections));
  const length = caseStudyLength(sections, { description, overview: legacy.overview, challenge: legacy.challenge });
  const nextOrder = () => sections.reduce((max, s) => Math.max(max, s.order + 1), 0);

  const startEdit = (section: EditableSection) => { setError(""); setPicking(false); setEditing(section.id); setDraft(toDraft(section)); };
  const startNew = (type: CaseStudySectionType) => { setError(""); setPicking(false); setEditing("new"); setDraft(newDraft(type)); };
  const cancel = () => { setEditing(null); setDraft(null); setError(""); };

  async function saveDraft() {
    if (!draft || !editing) return;
    const body = toBody(draft);
    const check = checkBlock(body.type, body.payload, body.metadata);
    if (!check.ok) { setError(check.error); return; }
    setBusy(true); setError("");
    const isNew = editing === "new";
    const response = await fetch(isNew ? `/api/projects/${projectId}/sections` : `/api/projects/${projectId}/sections/${editing}`, {
      method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, order: isNew ? nextOrder() : sections.find((s) => s.id === editing)?.order ?? 0 }),
    });
    setBusy(false);
    if (!response.ok) { setError(await readError(response, "The block could not be saved.")); return; }
    if (isNew) { const created = await response.json(); setSections((current) => [...current, created]); }
    else setSections((current) => current.map((s) => (s.id === editing ? { ...s, ...body } : s)));
    cancel();
  }

  async function duplicate(section: EditableSection) {
    const body = toBody(toDraft(section));
    const response = await fetch(`/api/projects/${projectId}/sections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, title: body.title ? `${body.title} (copy)` : null, metadata: { ...body.metadata, hidden: true, legacy: undefined }, order: nextOrder() }) });
    if (response.ok) { const created = await response.json(); setSections((current) => [...current, created]); }
    else setError(await readError(response, "The block could not be duplicated."));
  }

  async function toggleHidden(section: EditableSection) {
    const draftValue = toDraft(section);
    const body = toBody({ ...draftValue, settings: { ...draftValue.settings, hidden: !draftValue.settings.hidden } });
    const response = await fetch(`/api/projects/${projectId}/sections/${section.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, order: section.order }) });
    if (response.ok) { setError(""); setSections((current) => current.map((s) => (s.id === section.id ? { ...s, ...body } : s))); }
    else setError(await readError(response, "The block could not be updated."));
  }

  async function remove(section: EditableSection) {
    if (!window.confirm(`Remove "${section.title || TYPE_INFO[toDraft(section).type].label}"? This cannot be undone.`)) return;
    const response = await fetch(`/api/projects/${projectId}/sections/${section.id}`, { method: "DELETE" });
    if (response.ok) setSections((current) => current.filter((s) => s.id !== section.id));
    else setError("The block could not be removed.");
  }

  async function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((item, order) => ({ ...item, order }));
    setSections(ordered);
    const response = await fetch(`/api/projects/${projectId}/sections`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ordered.map(({ id, order }) => ({ id, order }))) });
    if (!response.ok) setError("The new order could not be saved.");
  }

  async function addSet(body: { template: CaseStudyTemplate } | { legacy: true }) {
    setBusy(true); setError("");
    const response = await fetch(`/api/projects/${projectId}/sections/starter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!response.ok) { setError(await readError(response, "The blocks could not be added.")); return; }
    const created: EditableSection[] = await response.json();
    setSections((current) => ("legacy" in body
      ? [...created, ...current.map((s) => ({ ...s, order: s.order + created.length }))]
      : [...current, ...created]).sort((a, b) => a.order - b.order));
  }

  return (
    <section className="mt-12 border-t border-border-subtle pt-8" aria-labelledby="case-study-blocks-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="case-study-blocks-title" className="text-xl font-semibold">Case study</h2>
          <p className="mt-2 max-w-xl text-sm text-text-tertiary">Build the story from blocks. Each block can have images, GIFs or videos, or just text. Hidden blocks are drafts: only you see them, in the preview.</p>
        </div>
        <a href={`/admin/projects/${projectId}/preview`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-4 text-sm font-semibold">
          <ExternalLink size={16} aria-hidden="true" /> Preview case study
        </a>
      </div>

      <div className={`mt-4 rounded-lg border p-4 text-sm ${length.overBudget ? "border-[#E0A100] bg-[#FFF8E1] text-[#4A3500]" : "border-border-subtle"}`}>
        <p className="font-semibold">Reading time: about {length.minutes} min · {length.words} words{length.media ? ` · ${length.media} media` : ""}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-tertiary" aria-hidden="true">
          <div className={`h-full rounded-full ${length.overBudget ? "bg-[#B07D00]" : "bg-[#257A4C]"}`} style={{ width: `${Math.min(100, Math.round((length.words / WORD_BUDGET) * 100))}%` }} />
        </div>
        <p className="mt-2">
          {length.overBudget
            ? `Over the ${READ_TIME_TARGET_MINUTES}-minute target. Recruiters skim: shorten or hide blocks until it reads in ${READ_TIME_TARGET_MINUTES} minutes (about ${WORD_BUDGET} words), and let screens do the explaining. Hidden blocks don't count and aren't deleted.`
            : `Within the ${READ_TIME_TARGET_MINUTES}-minute target (about ${WORD_BUDGET} words). Hidden blocks don't count.`}
        </p>
      </div>

      {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

      {legacyLeft.length > 0 && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-secondary p-4 text-sm">
          <p className="font-semibold">Turn the old project text into blocks</p>
          <p className="mt-1 text-text-secondary">
            {legacyLeft.map((block) => block.eyebrow).join(", ")} will become editable text blocks at the top. Overview and Challenge stay visible; text that was never public arrives hidden for you to review. Nothing is deleted.
          </p>
          <button type="button" disabled={busy} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-bg-inverse px-5 text-sm font-semibold text-text-inverse" onClick={() => addSet({ legacy: true })}>Convert to blocks</button>
        </div>
      )}

      {sections.length === 0 && editing === null && (
        <div className="mt-6">
          <p className="text-sm font-semibold">Start from a template</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {(Object.keys(caseStudyTemplates) as CaseStudyTemplate[]).map((key) => (
              <button key={key} type="button" disabled={busy} className="rounded-lg border border-border-default p-4 text-left hover:bg-bg-secondary" onClick={() => addSet({ template: key })}>
                <span className="block font-semibold">{caseStudyTemplates[key].label}</span>
                <span className="mt-1 block text-xs text-text-tertiary">{caseStudyTemplates[key].description}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-tertiary">Template blocks arrive hidden. Fill them in, then show them.</p>
        </div>
      )}

      <ol className="mt-6 space-y-3">
        {sections.map((section, index) => {
          const info = toDraft(section);
          const isEditing = editing === section.id;
          return (
            <li key={section.id} className={`rounded-lg border ${isEditing ? "border-border-default" : "border-border-subtle"} p-4`}>
              {isEditing && draft ? (
                <BlockForm draft={draft} onChange={setDraft} onSave={saveDraft} onCancel={cancel} busy={busy} heading={`Edit block ${index + 1}`} />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">{String(index + 1).padStart(2, "0")} · {TYPE_INFO[info.type].label}</p>
                    <p className="font-medium">{section.title || "Untitled block"}</p>
                    <p className="mt-1 flex flex-wrap gap-2 text-xs">
                      {info.settings.hidden && <span className="rounded-full bg-[#FFF4CC] px-2 py-0.5 font-semibold text-[#5C4300]">Hidden draft</span>}
                      {info.media.length > 0 ? <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-text-secondary">{info.media.length} media</span> : !payloadHasMedia(section.payload) && <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-text-secondary">No image yet: shows a tinted panel</span>}
                      {(() => { const words = blockWords(section); return <span className={`rounded-full px-2 py-0.5 ${words > BLOCK_WORD_GUIDE ? "bg-[#FFF4CC] font-semibold text-[#5C4300]" : "bg-bg-secondary text-text-secondary"}`}>{words} words</span>; })()}
                      {info.settings.legacy && <span className="rounded-full bg-bg-secondary px-2 py-0.5 text-text-secondary">From old {info.settings.legacy} text</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button type="button" className={iconButton} onClick={() => startEdit(section)}><Pencil size={16} aria-hidden="true" /> Edit</button>
                    <button type="button" className={iconButton} onClick={() => toggleHidden(section)} aria-label={info.settings.hidden ? `Show block ${index + 1} on the public page` : `Hide block ${index + 1}`}>
                      {info.settings.hidden ? <><Eye size={16} aria-hidden="true" /> Show</> : <><EyeOff size={16} aria-hidden="true" /> Hide</>}
                    </button>
                    <button type="button" className={iconButton} onClick={() => duplicate(section)} aria-label={`Duplicate block ${index + 1}`}><Copy size={16} aria-hidden="true" /></button>
                    <button type="button" className={iconButton} onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Move block ${index + 1} up`}><ArrowUp size={16} aria-hidden="true" /></button>
                    <button type="button" className={iconButton} onClick={() => moveBlock(index, 1)} disabled={index === sections.length - 1} aria-label={`Move block ${index + 1} down`}><ArrowDown size={16} aria-hidden="true" /></button>
                    <button type="button" className={`${iconButton} text-error`} onClick={() => remove(section)} aria-label={`Remove block ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6">
        {editing === "new" && draft ? (
          <div className="rounded-lg border border-border-default p-4">
            <BlockForm draft={draft} onChange={setDraft} onSave={saveDraft} onCancel={cancel} busy={busy} heading="New block" />
          </div>
        ) : picking ? (
          <div className="rounded-lg border border-border-default p-4">
            <div className="flex items-center justify-between gap-4"><p className="font-semibold">Choose a block type</p><button type="button" className="min-h-11 px-3 text-sm" onClick={() => setPicking(false)}>Cancel</button></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {caseStudySectionTypes.map((type) => (
                <button key={type} type="button" className="rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-secondary" onClick={() => startNew(type)}>
                  <span className="block text-sm font-semibold">{TYPE_INFO[type].label}</span>
                  <span className="mt-0.5 block text-xs text-text-tertiary">{TYPE_INFO[type].description}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" disabled={editing !== null} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-bg-inverse px-6 text-sm font-semibold text-text-inverse disabled:opacity-50" onClick={() => { setPicking(true); setError(""); }}>
            <Plus size={16} aria-hidden="true" /> Add block
          </button>
        )}
      </div>
    </section>
  );
}

function BlockForm({ draft, onChange, onSave, onCancel, busy, heading }: { draft: Draft; onChange: (draft: Draft) => void; onSave: () => void; onCancel: () => void; busy: boolean; heading: string }) {
  const info = TYPE_INFO[draft.type];
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const setSettings = (patch: Partial<Settings>) => onChange({ ...draft, settings: { ...draft.settings, ...patch } });
  return (
    <div className="space-y-6">
      <div>
        <p className="font-semibold">{heading}</p>
        <label className="mt-3 block text-sm font-medium">Block type
          <select className={select} value={draft.type} onChange={(event) => { const type = event.target.value as CaseStudySectionType; set({ type, payload: emptyPayload(type, draft.payload) }); }}>
            {caseStudySectionTypes.map((type) => <option key={type} value={type}>{TYPE_INFO[type].label}</option>)}
          </select>
          <span className="mt-1 block text-xs font-normal text-text-tertiary">{info.description}</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextControl label="Eyebrow" value={draft.eyebrow} onChange={(eyebrow) => set({ eyebrow })} help="Small label above the title, e.g. Research." />
        <TextControl label="Title" value={draft.title} onChange={(title) => set({ title })} help="Also used in “On this page”." />
      </div>
      <TextControl label={info.textLabel} multiline value={draft.content} onChange={(content) => set({ content })} help={draft.type === "rich_text" ? "Start a line with ## for a subheading or - for a point." : "Optional text shown before the fields below."} />

      {info.fields.length > 0 && <PayloadFields fields={info.fields} value={draft.payload} onChange={(payload) => set({ payload })} />}
      {(() => { const words = blockWords({ title: draft.title, content: draft.content, payload: draft.type === "rich_text" ? null : draft.payload }); return <p className={`text-sm ${words > BLOCK_WORD_GUIDE ? "font-semibold text-[#5C4300]" : "text-text-tertiary"}`} aria-live="polite">{words} words in this block. Aim for {BLOCK_WORD_GUIDE} or fewer, so the case study stays under 2 minutes.</p>; })()}

      <div className="space-y-4 rounded-lg bg-bg-secondary p-4">
        <MediaListControl label="Images for this block" help="Every section has an image area beside the text. Add screenshots, GIFs or videos here; with none, the page shows a tinted panel with the section number." value={draft.media} onChange={(media) => set({ media })} />
        {(
          <label className="block text-sm font-medium">Image position
            <select className={select} value={draft.settings.mediaLayout} onChange={(event) => setSettings({ mediaLayout: event.target.value as Settings["mediaLayout"] })}>
              {mediaLayouts.map((layout) => <option key={layout} value={layout}>{MEDIA_LAYOUT_LABELS[layout]}</option>)}
            </select>
          </label>
        )}
      </div>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Layout and visibility</legend>
        <label className="block text-sm font-medium">Width
          <select className={select} value={draft.settings.width} onChange={(event) => setSettings({ width: event.target.value as Settings["width"] })}>
            {blockWidths.map((width) => <option key={width} value={width}>{WIDTH_LABELS[width]}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Background
          <select className={select} value={draft.settings.background} onChange={(event) => setSettings({ background: event.target.value as Settings["background"] })}>
            {blockBackgrounds.map((background) => <option key={background} value={background}>{BACKGROUND_LABELS[background]}</option>)}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={draft.settings.showInContents} onChange={(event) => setSettings({ showInContents: event.target.checked })} /> Show in “On this page”</label>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={draft.settings.hidden} onChange={(event) => setSettings({ hidden: event.target.checked })} /> Hide from the public page (draft)</label>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} className="min-h-12 rounded-full bg-bg-inverse px-6 text-sm font-semibold text-text-inverse disabled:opacity-50" onClick={onSave}>{busy ? "Saving…" : "Save block"}</button>
        <button type="button" className="min-h-12 rounded-full border border-border-default px-6 text-sm font-semibold" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
