"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { mediaKind } from "@/lib/project-card";
import type { FieldSpec } from "@/lib/case-study-blocks";
import { UPLOAD_ACCEPT, uploadMedia } from "../upload-media";

// Form controls for case-study blocks (ADR-011). Each block type's fields come from TYPE_INFO in
// lib/case-study-blocks.ts, so the admin never edits raw JSON.

export type MediaDraft = { url: string; alt: string; caption?: string; fit?: string; poster?: string; kind?: string };

const input = "mt-1 block w-full rounded-md border border-border-default bg-bg-primary p-3 text-sm";
const KIND_LABEL = { image: "Still image", gif: "Animated GIF", video: "Video" } as const;

export function TextControl({ label, value, onChange, multiline, required, help }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; required?: boolean; help?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}{required && <span className="text-text-tertiary"> (required)</span>}
      {multiline
        ? <textarea className={`${input} min-h-28 font-normal`} value={value} onChange={(event) => onChange(event.target.value)} />
        : <input className={`${input} font-normal`} value={value} onChange={(event) => onChange(event.target.value)} />}
      {help && <span className="mt-1 block text-xs font-normal text-text-tertiary">{help}</span>}
    </label>
  );
}

function MediaPreview({ url }: { url: string }) {
  if (!url) return <div className="flex aspect-[4/3] w-28 shrink-0 items-center justify-center rounded-md border border-dashed border-border-default text-text-tertiary"><ImagePlus size={20} aria-hidden="true" /></div>;
  const kind = mediaKind(url);
  // Admin thumbnails load directly; the public page goes through next/image.
  // eslint-disable-next-line @next/next/no-img-element
  return kind === "video" ? <video src={url} muted playsInline className="aspect-[4/3] w-28 shrink-0 rounded-md bg-bg-tertiary object-cover" /> : <img src={url} alt="" className="aspect-[4/3] w-28 shrink-0 rounded-md bg-bg-tertiary object-cover" />;
}

/** One image, GIF or video: upload or paste a link, then alt text, caption and display. */
export function MediaControl({ value, onChange, label, showCaption = true, showFit = true, imageOnly = false, help }: { value: MediaDraft; onChange: (value: MediaDraft) => void; label: string; showCaption?: boolean; showFit?: boolean; imageOnly?: boolean; help?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<MediaDraft>) => onChange({ ...value, ...patch });
  const kind = value.url ? mediaKind(value.url) : null;
  return (
    <fieldset className="rounded-lg border border-border-subtle p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      {help && <p className="mb-3 text-xs text-text-tertiary">{help}</p>}
      <div className="flex flex-col gap-4 sm:flex-row">
        <MediaPreview url={value.url} />
        <div className="min-w-0 flex-1 space-y-3">
          <label className="block text-sm font-medium">Upload an image or GIF
            <input type="file" accept={UPLOAD_ACCEPT} className="mt-1 block w-full text-sm font-normal" disabled={busy} onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true); setError("");
              const result = await uploadMedia(file);
              setBusy(false);
              if ("error" in result) setError(result.error); else set({ url: result.url, alt: value.alt || result.alt });
              event.target.value = "";
            }} />
          </label>
          {busy && <p className="text-xs text-text-tertiary" role="status">Uploading…</p>}
          {error && <p className="text-xs text-error" role="alert">{error}</p>}
          <TextControl label="Or paste a link" value={value.url} onChange={(url) => set({ url })} help={imageOnly ? "A still image: upload one, or paste a Cloudinary or Unsplash link." : "For video, upload it to Cloudinary and paste the link. Videos play muted on a loop with a pause button."} />
          {kind && <p className="text-xs text-text-tertiary">Detected: {KIND_LABEL[kind]}</p>}
          <TextControl label="Alt text" required value={value.alt} onChange={(alt) => set({ alt })} help="What the image shows, for screen readers." />
          {showCaption && <TextControl label="Caption" value={value.caption ?? ""} onChange={(caption) => set({ caption })} help="Optional. Shown under the media." />}
          {showFit && <label className="block text-sm font-medium">Display
            <select className={input} value={value.fit ?? ""} onChange={(event) => set({ fit: event.target.value || undefined })}>
              <option value="">Show the whole image (recommended for screens)</option>
              <option value="cover">Fill the frame (may crop the edges)</option>
            </select>
          </label>}
          {kind === "video" && !imageOnly && <TextControl label="Poster image link" value={value.poster ?? ""} onChange={(poster) => set({ poster })} help="Optional still frame shown before the video plays." />}
        </div>
      </div>
    </fieldset>
  );
}

function RowButtons({ index, count, onMove, onRemove, label, min = 0 }: { index: number; count: number; onMove: (from: number, to: number) => void; onRemove: (index: number) => void; label: string; min?: number }) {
  return (
    <div className="flex gap-1">
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-bg-secondary disabled:opacity-40" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} ${index + 1} up`}><ArrowUp size={16} aria-hidden="true" /></button>
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md hover:bg-bg-secondary disabled:opacity-40" disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} ${index + 1} down`}><ArrowDown size={16} aria-hidden="true" /></button>
      <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-error hover:bg-bg-secondary disabled:opacity-40" disabled={count <= min} onClick={() => onRemove(index)} aria-label={`Remove ${label} ${index + 1}`}><Trash2 size={16} aria-hidden="true" /></button>
    </div>
  );
}

function move<T>(list: T[], from: number, to: number) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function MediaListControl({ value, onChange, label, itemLabel = "image", min = 0, help }: { value: MediaDraft[]; onChange: (value: MediaDraft[]) => void; label: string; itemLabel?: string; min?: number; help?: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{label}{min > 0 && <span className="font-normal text-text-tertiary"> (at least {min})</span>}</p>
      {help && <p className="text-xs text-text-tertiary">{help}</p>}
      {value.map((item, index) => (
        <div key={index} className="space-y-2">
          <MediaControl label={`${itemLabel[0].toUpperCase()}${itemLabel.slice(1)} ${index + 1}`} value={item} onChange={(next) => onChange(value.map((old, i) => (i === index ? next : old)))} />
          <RowButtons index={index} count={value.length} min={min} label={itemLabel} onMove={(from, to) => onChange(move(value, from, to))} onRemove={(i) => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-4 text-sm font-semibold" onClick={() => onChange([...value, { url: "", alt: "" }])}>
        <Plus size={16} aria-hidden="true" /> Add {itemLabel}
      </button>
    </div>
  );
}

const asText = (value: unknown) => (typeof value === "string" ? value : "");
const asMedia = (value: unknown): MediaDraft => {
  const item = value && typeof value === "object" ? (value as Partial<MediaDraft>) : {};
  return { ...item, url: item.url ?? "", alt: item.alt ?? "" };
};
const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** The typed fields for one block type. */
export function PayloadFields({ fields, value, onChange }: { fields: FieldSpec[]; value: Record<string, unknown>; onChange: (value: Record<string, unknown>) => void }) {
  const set = (key: string, next: unknown) => onChange({ ...value, [key]: next });
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        if (field.kind === "text" || field.kind === "textarea") {
          return <TextControl key={field.key} label={field.label} required={field.required} help={field.help} multiline={field.kind === "textarea"} value={asText(value[field.key])} onChange={(text) => set(field.key, text)} />;
        }
        if (field.kind === "media") return <MediaControl key={field.key} label={field.label} value={asMedia(value[field.key])} onChange={(media) => set(field.key, media)} />;
        if (field.kind === "mediaList") return <MediaListControl key={field.key} label={field.label} help={field.help} min={field.min} value={asList(value[field.key]).map(asMedia)} onChange={(list) => set(field.key, list)} />;
        if (field.kind === "strings") {
          const list = asList(value[field.key]).map(asText);
          return (
            <div key={field.key} className="space-y-3">
              <p className="text-sm font-semibold">{field.label}</p>
              {list.map((item, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1"><TextControl label={`${field.itemLabel[0].toUpperCase()}${field.itemLabel.slice(1)} ${index + 1}`} value={item} onChange={(text) => set(field.key, list.map((old, i) => (i === index ? text : old)))} /></div>
                  <RowButtons index={index} count={list.length} min={field.min} label={field.itemLabel} onMove={(from, to) => set(field.key, move(list, from, to))} onRemove={(i) => set(field.key, list.filter((_, j) => j !== i))} />
                </div>
              ))}
              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-4 text-sm font-semibold" onClick={() => set(field.key, [...list, ""])}><Plus size={16} aria-hidden="true" /> Add {field.itemLabel}</button>
            </div>
          );
        }
        if (field.kind !== "rows") return null;
        const rows = asList(value[field.key]).map((row) => (row && typeof row === "object" ? (row as Record<string, unknown>) : {}));
        return (
          <div key={field.key} className="space-y-3">
            <p className="text-sm font-semibold">{field.label}{field.min ? <span className="font-normal text-text-tertiary"> (at least {field.min})</span> : null}</p>
            {field.help && <p className="text-xs text-text-tertiary">{field.help}</p>}
            {rows.map((row, index) => (
              <fieldset key={index} className="space-y-3 rounded-lg border border-border-subtle p-4">
                <legend className="px-1 text-sm font-semibold">{`${field.itemLabel[0].toUpperCase()}${field.itemLabel.slice(1)} ${index + 1}`}</legend>
                {field.fields.map((sub) => (
                  <TextControl key={sub.key} label={sub.label} required={sub.required} multiline={sub.kind === "textarea"} value={asText(row[sub.key])} onChange={(text) => set(field.key, rows.map((old, i) => (i === index ? { ...old, [sub.key]: text } : old)))} />
                ))}
                <RowButtons index={index} count={rows.length} min={field.min} label={field.itemLabel} onMove={(from, to) => set(field.key, move(rows, from, to))} onRemove={(i) => set(field.key, rows.filter((_, j) => j !== i))} />
              </fieldset>
            ))}
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-default px-4 text-sm font-semibold" onClick={() => set(field.key, [...rows, Object.fromEntries(field.fields.map((sub) => [sub.key, ""]))])}><Plus size={16} aria-hidden="true" /> Add {field.itemLabel}</button>
          </div>
        );
      })}
    </div>
  );
}
