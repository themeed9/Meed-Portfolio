"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Plus, RotateCcw, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { cleanHomeValue, homeSectionByKey, homeSections, type HomeField } from "@/lib/home-content-cms";
import { MediaControl, TextControl, type MediaDraft } from "./case-study/BlockFields";

// Admin → Content (owner request, 2026-11-25): one form per homepage section, in the order they
// appear on the live site, with text and image/GIF/video fields. Saves are validated on the server.

type SectionState = { key: string; value: Record<string, unknown>; stored: boolean };
type Project = { slug: string; title: string };

const isObj = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const asText = (value: unknown) => (typeof value === "string" ? value : "");

const toDraft = (value: unknown): MediaDraft => {
  const m = isObj(value) ? value : {};
  return { url: asText(m.src), alt: asText(m.alt), kind: asText(m.kind) || undefined, poster: asText(m.poster) || undefined };
};
const fromDraft = (draft: MediaDraft) => ({ src: draft.url, alt: draft.alt, ...(draft.kind ? { kind: draft.kind } : {}), ...(draft.poster ? { poster: draft.poster } : {}) });

function emptyRow(fields: HomeField[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((f) => [f.key, f.kind === "group" ? emptyRow(f.fields) : f.kind === "list" || f.kind === "projects" ? [] : f.kind === "media" ? undefined : ""]));
}

const iconButton = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-bg-secondary disabled:opacity-40";

function Fields({ fields, value, onChange, projects }: { fields: HomeField[]; value: Record<string, unknown>; onChange: (next: Record<string, unknown>) => void; projects: Project[] }) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const current = value[field.key];
        if (field.kind === "media") {
          return (
            <MediaControl key={field.key} label={field.label} help={field.help} showCaption={false} showFit={false} imageOnly={field.imageOnly}
              value={toDraft(current)} onChange={(draft) => set(field.key, draft.url || draft.alt ? fromDraft(draft) : undefined)} />
          );
        }
        if (field.kind === "group") {
          return (
            <fieldset key={field.key} className="space-y-4 rounded-lg border border-border-subtle p-4">
              <legend className="px-1 text-sm font-semibold">{field.label}</legend>
              {field.help && <p className="text-xs text-text-tertiary">{field.help}</p>}
              <Fields fields={field.fields} value={isObj(current) ? current : {}} onChange={(next) => set(field.key, next)} projects={projects} />
            </fieldset>
          );
        }
        if (field.kind === "list") {
          const rows = Array.isArray(current) ? current.filter(isObj) : [];
          const move = (from: number, to: number) => { const next = [...rows]; const [row] = next.splice(from, 1); next.splice(to, 0, row); set(field.key, next); };
          const label = `${field.itemLabel[0].toUpperCase()}${field.itemLabel.slice(1)}`;
          return (
            <div key={field.key} className="space-y-3">
              <p className="text-sm font-semibold">{field.label}</p>
              {field.help && <p className="text-xs text-text-tertiary">{field.help}</p>}
              {rows.map((row, index) => (
                <fieldset key={index} className="space-y-4 rounded-lg border border-border-subtle p-4">
                  <legend className="px-1 text-sm font-semibold">{label} {index + 1}{typeof row.title === "string" && row.title ? `: ${row.title}` : ""}</legend>
                  <Fields fields={field.fields} value={row} onChange={(next) => set(field.key, rows.map((old, i) => (i === index ? next : old)))} projects={projects} />
                  <div className="flex gap-1">
                    <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`Move ${field.itemLabel} ${index + 1} up`}><ArrowUp size={16} aria-hidden="true" /></button>
                    <button type="button" className={iconButton} disabled={index === rows.length - 1} onClick={() => move(index, index + 1)} aria-label={`Move ${field.itemLabel} ${index + 1} down`}><ArrowDown size={16} aria-hidden="true" /></button>
                    <button type="button" className={`${iconButton} text-error`} onClick={() => set(field.key, rows.filter((_, i) => i !== index))} aria-label={`Remove ${field.itemLabel} ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></button>
                  </div>
                </fieldset>
              ))}
              {rows.length < field.max && (
                <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-4 text-sm font-semibold" onClick={() => set(field.key, [...rows, emptyRow(field.fields)])}>
                  <Plus size={16} aria-hidden="true" /> Add {field.itemLabel}
                </button>
              )}
            </div>
          );
        }
        if (field.kind === "projects") {
          const hidden = new Set(Array.isArray(current) ? current.map(asText) : []);
          return (
            <fieldset key={field.key} className="rounded-lg border border-border-subtle p-4">
              <legend className="px-1 text-sm font-semibold">{field.label}</legend>
              {projects.length === 0 ? <p className="text-sm text-text-tertiary">No published projects yet.</p> : (
                <div className="grid gap-1 sm:grid-cols-2">
                  {projects.map((project) => (
                    <label key={project.slug} className="flex min-h-11 items-center gap-3 text-sm">
                      <input type="checkbox" className="h-5 w-5" checked={hidden.has(project.slug)} onChange={(event) => {
                        const next = new Set(hidden);
                        if (event.target.checked) next.add(project.slug); else next.delete(project.slug);
                        set(field.key, [...next]);
                      }} />
                      Hide {project.title}
                    </label>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-text-tertiary">A project’s tile image is its Homepage image, set in Projects → Edit.</p>
            </fieldset>
          );
        }
        return (
          <TextControl key={field.key} label={field.label} required={field.required} help={field.help} multiline={field.kind === "textarea"}
            value={asText(current)} onChange={(text) => set(field.key, text)} />
        );
      })}
    </div>
  );
}

const VIEW_LINKS: Record<string, string> = { "home-hero": "/", "home-strip": "/", "home-more-work": "/", "home-about": "/#about", "home-beyond": "/#beyond", "home-contact": "/#contact", "site-footer": "/", "brand-page": "/brand" };

function SectionCard({ initial, projects, index }: { initial: SectionState; projects: Project[]; index: number }) {
  const section = homeSectionByKey(initial.key)!;
  const [value, setValue] = useState(initial.value);
  const [stored, setStored] = useState(initial.stored);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function save() {
    setBusy(true); setStatus(null);
    const response = await fetch(`/api/content/sections/${section.key}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: cleanHomeValue(section.fields, value) }) });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (response.ok) { setStored(true); setDirty(false); setStatus({ kind: "ok", text: "Saved. It is live now." }); }
    else setStatus({ kind: "error", text: typeof data.error === "string" ? data.error : "This section could not be saved." });
  }

  async function reset() {
    if (!window.confirm(`Reset "${section.title}" to the site's default text and images? Your saved changes to this section will be removed.`)) return;
    setBusy(true); setStatus(null);
    const response = await fetch(`/api/content/sections/${section.key}`, { method: "DELETE" });
    setBusy(false);
    if (response.ok) { window.location.reload(); }
    else setStatus({ kind: "error", text: "This section could not be reset." });
  }

  return (
    <details className="group rounded-xl border border-border-subtle bg-bg-primary" open={index === 0}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-4">
        <span>
          <span className="block font-semibold">{index + 1}. {section.title}</span>
          <span className="block text-sm text-text-tertiary">{section.description}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className={`rounded-full px-2 py-0.5 text-xs ${stored ? "bg-bg-secondary text-text-secondary" : "bg-[#FFF4CC] font-semibold text-[#5C4300]"}`}>{stored ? "Edited" : "Default text"}</span>
          <ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="space-y-6 border-t border-border-subtle p-4">
        <Fields fields={section.fields} value={value} onChange={(next) => { setValue(next); setDirty(true); setStatus(null); }} projects={projects} />
        {status && <p role={status.kind === "error" ? "alert" : "status"} className={`rounded-md p-3 text-sm ${status.kind === "error" ? "border border-red-200 bg-red-50 text-red-700" : "bg-[#E7F3EC] text-[#0B3D2E]"}`}>{status.text}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} className="min-h-12 rounded-full bg-bg-inverse px-6 text-sm font-semibold text-text-inverse disabled:opacity-50" onClick={save}>{busy ? "Saving…" : `Save ${section.title}`}</button>
          <a href={VIEW_LINKS[section.key] ?? "/"} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border-default px-5 text-sm font-semibold"><ExternalLink size={16} aria-hidden="true" /> View on site</a>
          {stored && <button type="button" disabled={busy} className="inline-flex min-h-12 items-center gap-2 px-3 text-sm text-text-secondary" onClick={reset}><RotateCcw size={16} aria-hidden="true" /> Reset to default</button>}
          {dirty && <span className="text-sm text-text-tertiary">Unsaved changes</span>}
        </div>
      </div>
    </details>
  );
}

export default function HomeContentEditor({ sections, projects }: { sections: SectionState[]; projects: Project[] }) {
  const ordered = homeSections.map((spec) => sections.find((s) => s.key === spec.key)).filter((s): s is SectionState => Boolean(s));
  return (
    <div className="space-y-3">
      {ordered.slice(0, 2).map((section, index) => <SectionCard key={section.key} initial={section} projects={projects} index={index} />)}
      <div className="rounded-xl border border-dashed border-border-default p-4 text-sm">
        <p className="font-semibold">3. Selected work</p>
        <p className="mt-1 text-text-tertiary">The project cards are edited per project: <a href="/admin/projects" className="font-semibold text-text-primary underline underline-offset-2">Projects</a> → Edit → Homepage card (text, colour, template and image or video). Set “Featured” to choose which projects appear here.</p>
      </div>
      {ordered.slice(2).map((section, index) => <SectionCard key={section.key} initial={section} projects={projects} index={index + 3} />)}
    </div>
  );
}
