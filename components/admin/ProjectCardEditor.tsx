"use client";

import { useState } from "react";
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import type { ProjectFormData } from "@/lib/validations";
import {
  cardPayloadSchemas,
  cardSkeleton,
  cardTemplates,
  cleanCardPayload,
  hexColorSchema,
  isCardTemplate,
  mediaKind,
  pickTextColor,
  tint,
  type CardTemplate,
} from "@/lib/project-card";

// ADR-010 phase 3: edit a project's homepage card without writing JSON.

type Media = { url: string; alt: string; width?: number; height?: number };
type Row = Record<string, unknown>;
type Payload = Record<string, unknown>;

const TEMPLATE_INFO: Record<CardTemplate, { label: string; hint: string }> = {
  media_split: { label: "Media split", hint: "Text beside one wide image. The default; uses the homepage or cover image if you add none here." },
  device_stage: { label: "Device stage", hint: "1–3 interface screens side by side on the project colour. For mobile products." },
  gallery_grid: { label: "Gallery grid", hint: "3–9 items in a grid; columns follow how many you add. For marketplaces and catalogues." },
  process_flow: { label: "Process flow", hint: "3–6 named steps in a row, stacked on mobile. For journeys and multi-step flows." },
  statement: { label: "Statement", hint: "One large sentence, with a small image or none. For idea-led projects." },
};

const TEXT_NAMES: Record<string, string> = { "#FFFFFF": "White", "#0B3D2E": "Deep forest", "#07100B": "Near-black", "#000000": "Black" };

const field = "mt-1 block w-full border border-border-default bg-bg-primary p-2 text-sm";
const smallButton = "min-h-11 px-3 text-sm border border-border-default";
const asArray = (value: unknown): Row[] => (Array.isArray(value) ? (value as Row[]) : []);
const asText = (value: unknown) => (typeof value === "string" ? value : "");

export default function ProjectCardEditor({ form }: { form: UseFormReturn<ProjectFormData> }) {
  const { register, setValue, watch } = form;
  const savedTemplate = watch("cardTemplate");
  const template: CardTemplate = isCardTemplate(savedTemplate) ? savedTemplate : "media_split";
  const [raw, setRaw] = useState<Payload>(() => {
    const initial = form.getValues("cardPayload");
    return initial && typeof initial === "object" && !Array.isArray(initial) ? (initial as Payload) : cardSkeleton(template);
  });

  const color = watch("primaryColor") ?? "";
  const validColor = hexColorSchema.safeParse(color).success;
  const text = validColor ? pickTextColor(color) : null;
  const cleaned = cleanCardPayload(raw);
  const check = cardPayloadSchemas[template].safeParse(cleaned);

  const commit = (next: Payload) => {
    setRaw(next);
    setValue("cardPayload", cleanCardPayload(next) as ProjectFormData["cardPayload"], { shouldDirty: true });
  };
  const set = (key: string, value: unknown) => commit({ ...raw, [key]: value });
  const changeTemplate = (next: CardTemplate) => {
    setValue("cardTemplate", next, { shouldDirty: true });
    commit(cardSkeleton(next, raw));
  };

  return (
    <section className="space-y-6 border-t border-border-subtle pt-8" aria-labelledby="card-editor-title">
      <div>
        <h2 id="card-editor-title" className="text-xl font-semibold">Homepage card</h2>
        <p className="mt-2 text-sm text-text-tertiary">How this project appears in Selected work. Invalid or empty content falls back to the media split layout on the public site.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm">Collection
          <select className={`${field} min-h-11`} {...register("collection")}>
            <option value="product">Product project</option>
            <option value="brand">Brand and graphic design</option>
          </select>
          <span className="mt-1 block text-xs text-text-tertiary">Brand projects will be listed on their own page once it ships (ADR-010 phase 5).</span>
        </label>
        <label className="block text-sm">Template
          <select className={`${field} min-h-11`} value={template} onChange={(event) => changeTemplate(event.target.value as CardTemplate)}>
            {cardTemplates.map((value) => <option key={value} value={value}>{TEMPLATE_INFO[value].label}</option>)}
          </select>
          <span className="mt-1 block text-xs text-text-tertiary">{TEMPLATE_INFO[template].hint}</span>
        </label>
      </div>

      <div>
        <span className="block text-sm">Primary colour</span>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input type="color" aria-label="Pick primary colour" className="h-11 w-14 cursor-pointer border border-border-default" value={validColor ? color : "#FFFFFF"} onChange={(event) => setValue("primaryColor", event.target.value.toUpperCase(), { shouldDirty: true })} />
          <input className={`${field} mt-0 max-w-40 font-mono`} placeholder="#1872F5" aria-label="Primary colour hex" {...register("primaryColor")} />
          {color && <button type="button" className={smallButton} onClick={() => setValue("primaryColor", "", { shouldDirty: true })}>Clear</button>}
        </div>
        <p className="mt-2 text-sm" aria-live="polite">
          {!color && "No colour: the card uses the neutral page background."}
          {color && !validColor && <span className="text-error">Use a 6-digit hex colour such as #1872F5.</span>}
          {text && <>Text colour: <strong>{TEXT_NAMES[text.color] ?? text.color}</strong> ({text.color}) · contrast <strong>{text.ratio.toFixed(2)}:1</strong> · passes WCAG AA for body text</>}
        </p>
      </div>

      <TemplateSlots template={template} raw={raw} set={set} />
      <SharedSlots raw={raw} set={set} />

      {!check.success && (
        <div className="border border-error/40 p-3 text-sm text-error" role="status">
          <p className="font-medium">This card can’t be saved yet:</p>
          <ul className="mt-1 list-disc pl-5">{check.error.issues.slice(0, 5).map((issue, index) => <li key={index}>{issue.path.join(".") || "card"}: {issue.message}</li>)}</ul>
        </div>
      )}

      <div>
        <p className="text-sm font-medium">Preview</p>
        <p className="text-xs text-text-tertiary">A layout preview using your content and colour. Final typography and spacing are set in the public renderer (phase 4).</p>
        <CardPreview template={template} payload={check.success ? (check.data as Payload) : cleaned} color={validColor ? color : null} textColor={text?.color ?? null} title={watch("title") || "Project title"} summary={watch("recruiterSummary") || watch("description") || "Project summary"} fallbackImage={watch("homepageImage") || watch("coverImage") || ""} />
      </div>
    </section>
  );
}

function TemplateSlots({ template, raw, set }: { template: CardTemplate; raw: Payload; set: (key: string, value: unknown) => void }) {
  switch (template) {
    case "media_split":
      return <MediaList label="Card image (optional)" help="Leave empty to use the homepage or cover image." items={raw.image ? [raw.image as Row] : []} max={1} onChange={(items) => set("image", items[0])} />;
    case "statement":
      return <>
        <label className="block text-sm">Statement (one sentence, up to 200 characters)
          <textarea className={field} rows={2} maxLength={200} value={asText(raw.statement)} onChange={(event) => set("statement", event.target.value)} />
          <span className="text-xs text-text-tertiary">{asText(raw.statement).length}/200</span>
        </label>
        <MediaList label="Small image (optional)" items={raw.image ? [raw.image as Row] : []} max={1} onChange={(items) => set("image", items[0])} />
      </>;
    case "device_stage":
      return <>
        <MediaList label="Interface screens (1–3)" help="Screens are shown whole, never cropped." items={asArray(raw.screens)} max={3} onChange={(items) => set("screens", items)} />
        <RowList label="Design targets (optional, up to 3)" help="Shown labelled as targets. Use only for design targets or hypotheses, never as results." rows={asArray(raw.targets)} max={3} empty={{ value: "", caption: "" }} fields={[["value", "Figure", 16], ["caption", "What it measures", 120]]} onChange={(rows) => set("targets", rows)} />
      </>;
    case "gallery_grid":
      return <>
        <MediaList label="Gallery items (3–9)" items={asArray(raw.items)} max={9} onChange={(items) => set("items", items)} />
        <StringList label="Short labels (optional, up to 4)" help="For example buyer journeys such as “I need guidance”." values={Array.isArray(raw.labels) ? (raw.labels as string[]) : []} max={4} onChange={(values) => set("labels", values)} />
      </>;
    case "process_flow":
      return <StepList steps={asArray(raw.steps)} onChange={(steps) => set("steps", steps)} />;
  }
}

function SharedSlots({ raw, set }: { raw: Payload; set: (key: string, value: unknown) => void }) {
  return <>
    <RowList label="Facts (optional, up to 4)" help="Short label and value pairs, for example Role · Product Designer." rows={asArray(raw.facts)} max={4} empty={{ label: "", value: "" }} fields={[["label", "Label", 40], ["value", "Value", 160]]} onChange={(rows) => set("facts", rows)} />
    <label className="block text-sm">Link label (optional)
      <input className={field} maxLength={40} placeholder="Read the case study" value={asText(raw.ctaLabel)} onChange={(event) => set("ctaLabel", event.target.value)} />
    </label>
  </>;
}

async function uploadImage(file: File): Promise<Media | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok || typeof data.url !== "string") return { error: data.error || "Upload failed" };
    return { url: data.url, alt: file.name.replace(/\.[^.]+$/, ""), width: data.width, height: data.height };
  } catch {
    return { error: "Upload failed" };
  }
}

const KIND_LABEL = { image: "still image", gif: "animated GIF", video: "video" } as const;

function MediaThumb({ url }: { url: string }) {
  if (!url) return null;
  const kind = mediaKind(url);
  if (kind === "video") return <video src={url} muted loop playsInline autoPlay className="absolute inset-0 h-full w-full object-contain" aria-hidden="true" />;
  return <Image src={url} alt="" fill sizes="96px" unoptimized={kind === "gif"} className="object-contain" />;
}

function MediaList({ label, help, items, max, onChange }: { label: string; help?: string; items: Row[]; max: number; onChange: (items: Row[]) => void }) {
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const update = (index: number, patch: Row) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      {help && <p className="text-xs text-text-tertiary">{help}</p>}
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 border-t border-border-subtle pt-3 sm:grid-cols-[6rem_1fr]">
          <div className="relative aspect-square overflow-hidden bg-bg-tertiary"><MediaThumb url={asText(item.url)} /></div>
          <div className="space-y-2">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" aria-label={`Upload image or GIF ${index + 1}`} className="block w-full text-sm" disabled={busy !== null} onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(index); setError("");
              const result = await uploadImage(file);
              if ("error" in result) setError(result.error); else update(index, { ...result, alt: asText(item.alt) || result.alt });
              setBusy(null);
            }} />
            {busy === index && <p className="text-xs text-text-tertiary">Uploading…</p>}
            <label className="block text-xs">Media URL (image, GIF or video)<input className={field} value={asText(item.url)} onChange={(event) => update(index, { url: event.target.value, width: undefined, height: undefined })} /></label>
            {asText(item.url) && <p className="text-xs text-text-tertiary">Detected: {KIND_LABEL[mediaKind(asText(item.url))]}. Videos play muted on a loop with a pause button; upload them to Cloudinary and paste the link.</p>}
            <label className="block text-xs">Display
              <select className={`${field} min-h-11`} value={asText(item.fit)} onChange={(event) => update(index, { fit: event.target.value || undefined })}>
                <option value="">Default for this layout</option>
                <option value="cover">Fill the container (may crop edges)</option>
                <option value="contain">Show the whole image or video</option>
              </select>
            </label>
            {mediaKind(asText(item.url)) === "video" && <label className="block text-xs">Poster image URL (optional, shown before the video plays)<input className={field} value={asText(item.poster)} onChange={(event) => update(index, { poster: event.target.value || undefined })} /></label>}
            <label className="block text-xs">Alternative text (required)<input className={field} maxLength={300} value={asText(item.alt)} onChange={(event) => update(index, { alt: event.target.value })} /></label>
            {typeof item.width === "number" && typeof item.height === "number" && <p className="text-xs text-text-tertiary">{item.width} × {item.height}px</p>}
            <div className="flex flex-wrap gap-2">
              {max > 1 && <><button type="button" className={smallButton} onClick={() => move(index, -1)} disabled={index === 0}>Up</button><button type="button" className={smallButton} onClick={() => move(index, 1)} disabled={index === items.length - 1}>Down</button></>}
              <button type="button" className={`${smallButton} text-error`} onClick={() => onChange(items.filter((_, i) => i !== index))}>Remove</button>
            </div>
          </div>
        </div>
      ))}
      {error && <p className="text-xs text-error">{error}</p>}
      {items.length < max && <button type="button" className={smallButton} onClick={() => onChange([...items, { url: "", alt: "" }])}>Add image</button>}
    </fieldset>
  );
}

function RowList({ label, help, rows, max, empty, fields, onChange }: { label: string; help?: string; rows: Row[]; max: number; empty: Row; fields: Array<[string, string, number]>; onChange: (rows: Row[]) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      {help && <p className="text-xs text-text-tertiary">{help}</p>}
      {rows.map((row, index) => (
        <div key={index} className="flex flex-wrap items-end gap-2">
          {fields.map(([key, name, maxLength]) => (
            <label key={key} className="block min-w-32 flex-1 text-xs">{name}
              <input className={field} maxLength={maxLength} value={asText(row[key])} onChange={(event) => onChange(rows.map((r, i) => (i === index ? { ...r, [key]: event.target.value } : r)))} />
            </label>
          ))}
          <button type="button" className={`${smallButton} text-error`} onClick={() => onChange(rows.filter((_, i) => i !== index))}>Remove</button>
        </div>
      ))}
      {rows.length < max && <button type="button" className={smallButton} onClick={() => onChange([...rows, { ...empty }])}>Add</button>}
    </fieldset>
  );
}

function StringList({ label, help, values, max, onChange }: { label: string; help?: string; values: string[]; max: number; onChange: (values: string[]) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      {help && <p className="text-xs text-text-tertiary">{help}</p>}
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input className={`${field} mt-0`} maxLength={60} aria-label={`Label ${index + 1}`} value={value} onChange={(event) => onChange(values.map((v, i) => (i === index ? event.target.value : v)))} />
          <button type="button" className={`${smallButton} text-error`} onClick={() => onChange(values.filter((_, i) => i !== index))}>Remove</button>
        </div>
      ))}
      {values.length < max && <button type="button" className={smallButton} onClick={() => onChange([...values, ""])}>Add label</button>}
    </fieldset>
  );
}

function StepList({ steps, onChange }: { steps: Row[]; onChange: (steps: Row[]) => void }) {
  const update = (index: number, patch: Row) => onChange(steps.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Steps (3–6)</legend>
      {steps.map((step, index) => {
        const media = (step.media as Row | undefined) ?? {};
        return (
          <div key={index} className="grid gap-2 border-t border-border-subtle pt-3 sm:grid-cols-3">
            <label className="block text-xs">Step {index + 1} name<input className={field} maxLength={40} value={asText(step.name)} onChange={(event) => update(index, { name: event.target.value })} /></label>
            <label className="block text-xs">Screen URL (optional)<input className={field} value={asText(media.url)} onChange={(event) => update(index, { media: { ...media, url: event.target.value } })} /></label>
            <label className="block text-xs">Screen alt text<input className={field} maxLength={300} value={asText(media.alt)} onChange={(event) => update(index, { media: { ...media, alt: event.target.value } })} /></label>
            <button type="button" className={`${smallButton} text-error sm:col-span-3 sm:w-fit`} onClick={() => onChange(steps.filter((_, i) => i !== index))}>Remove step</button>
          </div>
        );
      })}
      {steps.length < 6 && <button type="button" className={smallButton} onClick={() => onChange([...steps, { name: "" }])}>Add step</button>}
    </fieldset>
  );
}

function PreviewImage({ media, className }: { media?: Row; className: string }) {
  const url = asText(media?.url);
  return <div className={`relative overflow-hidden ${className}`} style={{ background: "rgba(127,127,127,.18)" }}><MediaThumb url={url} /></div>;
}

function CardPreview({ template, payload, color, textColor, title, summary, fallbackImage }: { template: CardTemplate; payload: Payload; color: string | null; textColor: string | null; title: string; summary: string; fallbackImage: string }) {
  const style = color ? { background: color, color: textColor ?? undefined } : { background: "var(--color-bg-primary, #fff)" };
  const inner = color ? { background: tint(color, 0.85) } : undefined;
  const facts = asArray(payload.facts);
  const heading = <div className="space-y-2"><p className="text-lg font-semibold">{title}</p><p className="text-xs opacity-80">{summary}</p>{facts.length > 0 && <p className="text-xs opacity-80">{facts.map((f) => `${asText(f.label)} · ${asText(f.value)}`).join("  ·  ")}</p>}<p className="text-xs font-semibold underline">{asText(payload.ctaLabel) || "Read the case study"} →</p></div>;
  let body: React.ReactNode;
  switch (template) {
    case "device_stage":
      body = <div className="grid grid-cols-2 gap-4">{heading}<div className="flex items-center justify-center gap-2">{asArray(payload.screens).map((s, i) => <PreviewImage key={i} media={s} className="aspect-[9/19] w-16 rounded-md" />)}</div>{asArray(payload.targets).length > 0 && <p className="col-span-2 text-xs">{asArray(payload.targets).map((t) => `Target ${asText(t.value)} ${asText(t.caption)}`).join("  ·  ")}</p>}</div>;
      break;
    case "gallery_grid": {
      const items = asArray(payload.items);
      const columns = items.length <= 4 ? 2 : 3;
      body = <div className="grid grid-cols-2 gap-4"><div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>{items.map((item, i) => <div key={i} className="p-1" style={inner}><PreviewImage media={item} className="aspect-[4/3]" /></div>)}</div><div>{heading}{Array.isArray(payload.labels) && <div className="mt-2 flex flex-wrap gap-1">{(payload.labels as string[]).map((l) => <span key={l} className="border border-current px-2 py-0.5 text-[10px]">{l}</span>)}</div>}</div></div>;
      break;
    }
    case "process_flow":
      body = <div className="space-y-3">{heading}<div className="flex gap-2">{asArray(payload.steps).map((step, i) => <div key={i} className="flex-1 p-2 text-[10px] font-semibold" style={inner ? { ...inner, color: "#07100B" } : { background: "rgba(127,127,127,.12)" }}>{asText(step.name) || `Step ${i + 1}`}{step.media ? <PreviewImage media={step.media as Row} className="mt-1 aspect-video" /> : null}</div>)}</div></div>;
      break;
    case "statement":
      body = <div className="space-y-2"><p className="text-xl font-medium leading-tight">{asText(payload.statement) || "Your statement"}</p><div className="flex items-center gap-3">{payload.image ? <PreviewImage media={payload.image as Row} className="h-10 w-16" /> : null}<p className="text-xs opacity-80">{title}</p></div></div>;
      break;
    default:
      body = <div className="grid grid-cols-2 gap-4">{heading}<PreviewImage media={(payload.image as Row | undefined) ?? (fallbackImage ? { url: fallbackImage, alt: "" } : undefined)} className="aspect-[4/3]" /></div>;
  }
  return <div className="mt-2 overflow-hidden rounded-[12px] border border-border-subtle p-5" style={style}>{body}</div>;
}
