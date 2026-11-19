import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { galleryColumns, mediaView, screenRatio, type CardMediaView, type CardView } from "@/lib/project-card-view";

// ADR-010 phase 4: one renderer for every homepage card template. Each project is a
// full-width band. With a primary colour the band is filled and every piece of text uses
// the auto-picked text colour at full strength (no opacity), so contrast always holds.
// Content is visible on first paint; the only motion is the existing 1.5% image hover.

const DEEP_FOREST = "#0B3D2E";

type Props = { view: CardView; fallbackImage?: string | null };

export default function ProjectCard({ view, fallbackImage }: Props) {
  const colored = view.colors !== null;
  // Card button (Figma): filled with the card's text colour; label in white, or ink on a white button.
  const style: CSSProperties | undefined = view.colors
    ? ({ background: view.colors.background, color: view.colors.text, "--cta-bg": view.colors.text, "--cta-fg": view.colors.text === "#FFFFFF" ? "#07100B" : "#FFFFFF" } as CSSProperties)
    : undefined;
  return (
    <article
      className={`project-card group ${colored ? "" : "bg-bg-primary text-text-primary"} border-b border-border-subtle`}
      style={style}
      aria-labelledby={`project-${view.id}-title`}
      data-template={view.template}
    >
      <div className="project-card-shell">
        <Layout view={view} fallbackImage={fallbackImage} />
      </div>
    </article>
  );
}

function Layout({ view, fallbackImage }: Props) {
  const { card } = view;
  switch (card.template) {
    case "device_stage":
      return (
        <div className="grid items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
          <Text view={view}>
            {card.payload.targets?.length ? (
              <dl className="mt-6 grid grid-cols-2 gap-6 sm:max-w-md">
                {card.payload.targets.map((target) => (
                  <div key={`${target.value}-${target.caption}`}>
                    <dt className="project-card-meta">Target</dt>
                    <dd className="mt-1"><span className="project-card-figure">{target.value}</span> <span className="block type-small">{target.caption}</span></dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </Text>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {card.payload.screens.map((screen, index) => (
              <Media
                key={screen.url + index}
                media={mediaView(screen, screenRatio())}
                // Landscape captures get a wider slot than phone-shaped screens, so neither is shrunk.
                className={screen.width && screen.height && screen.width >= screen.height ? "w-[46%] max-w-[380px]" : "w-[30%] max-w-[220px]"}
                contain
              />
            ))}
          </div>
        </div>
      );
    case "gallery_grid": {
      const columns = galleryColumns(card.payload.items.length);
      return (
        <div className="grid items-center gap-10 md:grid-cols-[7fr_5fr] md:gap-16">
          <ul className="order-last grid gap-3 sm:gap-4 md:order-first" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label={`${view.title} gallery`}>
            {card.payload.items.map((item, index) => (
              <li key={item.url + index} className="rounded-[12px] p-2" style={view.colors ? { background: view.colors.surface } : undefined}>
                <Media media={mediaView(item)} contain />
              </li>
            ))}
          </ul>
          <Text view={view}>
            {card.payload.labels?.length ? (
              <ul className="mt-6 flex flex-col items-start gap-2" aria-label="Key journeys">
                {card.payload.labels.map((label) => <li key={label} className="project-card-label">{label}</li>)}
              </ul>
            ) : null}
          </Text>
        </div>
      );
    }
    case "process_flow":
      return (
        <div className="grid gap-10 md:gap-12">
          <Text view={view} wide />
          <ol className="grid gap-3 md:grid-flow-col md:auto-cols-fr md:gap-3" aria-label={`${view.title} journey`}>
            {card.payload.steps.map((step, index) => (
              <li key={step.name + index} className="project-card-step" style={view.colors ? { background: view.colors.surface, color: DEEP_FOREST } : undefined}>
                <span className="project-card-meta">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-2 block type-h3">{step.name}</span>
                {step.media ? <Media media={mediaView(step.media)} className="mt-4" contain /> : null}
              </li>
            ))}
          </ol>
        </div>
      );
    case "statement":
      return (
        <div className="grid gap-8" data-reveal-group="">
          <p className="project-card-meta">{view.label}</p>
          <p className="project-card-statement">{card.payload.statement}</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
            {card.payload.image ? <Media media={mediaView(card.payload.image)} className="w-full max-w-[240px]" contain /> : null}
            <div className="min-w-0">
              <h3 id={`project-${view.id}-title`} className="type-h3">{view.title}</h3>
              <Facts view={view} />
              <Cta view={view} />
            </div>
          </div>
        </div>
      );
    default: {
      const image = card.payload.image ?? (fallbackImage ? { url: fallbackImage, alt: `${view.title} preview` } : undefined);
      return (
        <div className="grid items-center gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
          <Text view={view} />
          {image ? <Media media={mediaView(image)} /> : null}
        </div>
      );
    }
  }
}

function Text({ view, wide, children }: { view: CardView; wide?: boolean; children?: ReactNode }) {
  return (
    <div className={`min-w-0 ${wide ? "md:grid md:grid-cols-[1fr_auto] md:items-end md:gap-12" : ""}`} data-reveal-group={wide ? "" : undefined}>
      <div className="min-w-0" data-reveal-group={wide ? undefined : ""}>
        <p className="project-card-meta">{view.label}</p>
        <h3 id={`project-${view.id}-title`} className="project-card-title">{view.title}</h3>
        <p className="project-card-summary">{view.summary}</p>
        {children}
        <Facts view={view} />
        {!wide && <Cta view={view} />}
      </div>
      {wide && <Cta view={view} />}
    </div>
  );
}

function Facts({ view }: { view: CardView }) {
  if (!view.facts.length) return null;
  return (
    <dl className="project-card-facts">
      {view.facts.map((fact) => (
        <div key={fact.label + fact.value} className="contents">
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Cta({ view }: { view: CardView }) {
  return (
    <Link href={view.href} className="project-card-cta">
      {view.cta} <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

function Media({ media, className = "", contain }: { media: CardMediaView; className?: string; contain?: boolean }) {
  // A plain figure, not a second link: the CTA is the card's one link, and the image keeps its alt text.
  return (
    <div className={`relative block overflow-hidden rounded-[12px] ${className}`} style={{ aspectRatio: media.aspectRatio }}>
      <Image
        src={media.url}
        alt={media.alt}
        fill
        sizes="(max-width: 767px) 90vw, 50vw"
        className={`${contain ? "object-contain" : "object-cover"} transition-transform duration-[var(--duration-editorial)] ease-[var(--ease-standard)] group-hover:scale-[1.015] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
      />
    </div>
  );
}
