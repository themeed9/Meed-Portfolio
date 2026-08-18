import Image from "next/image";
import { normalizeSection, type CaseStudySectionRecord } from "@/lib/case-study";

type Normalized = ReturnType<typeof normalizeSection>;
type Media = { url: string; alt: string; caption?: string };

function RichText({ content }: { content: string }) {
  return <div className="space-y-4">{content.split("\n").map((line, index) => {
    if (line.startsWith("## ")) return <h3 key={index} className="pt-4 type-h3">{line.slice(3)}</h3>;
    if (line.startsWith("### ")) return <h4 key={index} className="pt-3 font-semibold">{line.slice(4)}</h4>;
    if (line.startsWith("- ")) return <p key={index} className="border-l-2 border-border-default pl-4 type-body text-text-secondary">{line.slice(2)}</p>;
    return line.trim() ? <p key={index} className="type-body text-text-secondary">{line}</p> : null;
  })}</div>;
}

function MediaSet({ media }: { media: Media[] }) {
  return <div className={`grid gap-6 ${media.length > 1 ? "md:grid-cols-2" : ""}`}>{media.map(item => <figure key={item.url}><div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary"><Image src={item.url} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" /></div>{item.caption && <figcaption className="mt-3 type-small text-text-tertiary">{item.caption}</figcaption>}</figure>)}</div>;
}

function Structured({ payload }: { payload: Record<string, unknown> }) {
  return <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">{Object.entries(payload).map(([key, value]) => typeof value === "string" ? <div key={key} className="border-t border-border-subtle pt-4"><dt className="type-micro uppercase tracking-[0.12em] text-text-tertiary">{key.replaceAll("_", " ")}</dt><dd className="mt-2 type-body text-text-secondary">{value}</dd></div> : null)}</dl>;
}

function Decision({ payload }: { payload: Record<string, unknown> }) {
  const fields = [["Context", payload.context], ["Decision", payload.decision], ["Why", payload.rationale], ["Trade-off", payload.tradeoff]];
  return <ol className="divide-y divide-border-subtle border-y border-border-subtle">{fields.map(([label,value],index) => typeof value === "string" && <li key={label as string} className="grid gap-3 py-6 md:grid-cols-[4rem_10rem_1fr]"><p className="type-micro text-text-tertiary">0{index+1}</p><p className="type-micro text-text-tertiary">{label as string}</p><p className={`${label === "Decision" ? "type-body-lg font-semibold text-text-primary" : "type-body text-text-secondary"}`}>{value}</p></li>)}</ol>;
}

function Annotated({ payload }: { payload: Record<string, unknown> }) {
  const media = payload.media as Media[];
  const annotations = Array.isArray(payload.annotations) ? payload.annotations as Array<{number:string;title:string;detail:string}> : [];
  return <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"><MediaSet media={media}/>{annotations.length>0&&<ol className="divide-y divide-border-subtle border-y border-border-subtle">{annotations.map(item=><li key={item.number} className="py-5"><p className="type-micro text-text-accent">{item.number}</p><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-2 type-small text-text-secondary">{item.detail}</p></li>)}</ol>}</div>;
}

function Outcome({ payload }: { payload: Record<string, unknown> }) {
  return <dl className="grid gap-8 md:grid-cols-3"><div><dt className="type-micro text-text-accent">Verified outcome</dt><dd className="mt-3 type-body-lg">{String(payload.result)}</dd></div>{typeof payload.evidence==="string"&&<div><dt className="type-micro text-text-tertiary">Product learning</dt><dd className="mt-3 type-body text-text-secondary">{payload.evidence}</dd></div>}{typeof payload.caveat==="string"&&<div><dt className="type-micro text-text-tertiary">Future hypothesis</dt><dd className="mt-3 type-body text-text-secondary">{payload.caveat}</dd></div>}</dl>;
}

function render(section: Normalized) {
  const payload = section.payload as Record<string, unknown> | null;
  if (section.imageUrl && (!payload || !section.payloadValid)) return <MediaSet media={[{ url: section.imageUrl, alt: section.imageAlt || section.title || "Case-study evidence", caption: section.imageAlt || undefined }]} />;
  if (!section.payloadValid || !payload) return <RichText content={section.content} />;
  if (section.type === "decision") return <Decision payload={payload} />;
  if (section.type === "annotated_screen" && Array.isArray(payload.media)) return <Annotated payload={payload} />;
  if (section.type === "outcome") return <Outcome payload={payload} />;
  if ("media" in payload && Array.isArray(payload.media)) return <MediaSet media={payload.media as Media[]} />;
  if ("events" in payload && Array.isArray(payload.events)) return <ol>{(payload.events as Array<{period:string;title:string;detail:string}>).map(event => <li key={`${event.period}-${event.title}`} className="grid gap-2 border-t border-border-subtle py-5 sm:grid-cols-[8rem_1fr]"><p className="type-small text-text-tertiary">{event.period}</p><div><h3 className="font-semibold">{event.title}</h3><p className="mt-2 type-body text-text-secondary">{event.detail}</p></div></li>)}</ol>;
  if ("items" in payload && Array.isArray(payload.items)) return <ul className="divide-y divide-border-subtle border-y border-border-subtle">{(payload.items as string[]).map(item => <li key={item} className="py-4 type-body text-text-secondary">{item}</li>)}</ul>;
  if (section.type === "before_after") { const before = payload.beforeMedia as Media; const after = payload.afterMedia as Media; return <><div className="grid gap-6 md:grid-cols-2"><MediaSet media={[before]} /><MediaSet media={[after]} /></div><Structured payload={{ change: payload.change, significance: payload.significance }} /></>; }
  if (section.type === "tradeoff" && Array.isArray(payload.options)) return <><div className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-border-subtle bg-border-subtle sm:grid-cols-2">{(payload.options as Array<{label:string;benefit:string;cost:string}>).map(option => <article key={option.label} className="bg-bg-primary p-6"><h3 className="font-semibold">{option.label}</h3><p className="mt-4 type-small text-text-secondary"><strong>Benefit:</strong> {option.benefit}</p><p className="mt-2 type-small text-text-secondary"><strong>Cost:</strong> {option.cost}</p></article>)}</div><p className="mt-5 type-body"><strong>Decision:</strong> {String(payload.decision)}</p></>;
  return <Structured payload={payload} />;
}

export default function CaseStudySection({ section }: { section: CaseStudySectionRecord }) {
  const normalized = normalizeSection(section);
  const emphasized = ["project_tldr", "decision", "evidence", "outcome"].includes(normalized.type);
  return <section data-section-type={normalized.type} className={`case-block case-block-${normalized.type} ${emphasized ? "py-4" : ""}`}>
    <header className="case-heading">{normalized.eyebrow && <p className="eyebrow">{normalized.eyebrow}</p>}{normalized.title && <h2 className="mt-4 type-h2">{normalized.title}</h2>}</header>
    <div className={`case-content ${normalized.title || normalized.eyebrow ? "mt-8" : ""}`}>{render(normalized)}</div>
  </section>;
}
