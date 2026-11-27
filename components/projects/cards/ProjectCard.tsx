import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Calendar, CircleDot, Clock, Info, Layers, MonitorSmartphone, Target, UserRound, type LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import CardVideo from "./CardVideo";
import { factIcon, galleryColumns, mediaView, screenRatio, type CardMediaView, type CardView, type FactIcon } from "@/lib/project-card-view";

// ADR-010 phase 4: one renderer for every homepage card template. Each project is a
// full-width band. With a primary colour the band is filled and every piece of text uses
// the auto-picked text colour at full strength (no opacity), so contrast always holds.
// Motion: each card rises in on scroll (ScrollReveal, [data-reveal]) with its media unmasking,
// lifts on hover/focus, and the image eases in a little. All of it is off with reduced motion.

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
      className={`project-card group ${colored ? "" : "bg-bg-secondary text-text-primary"}`}
      style={style}
      aria-labelledby={`project-${view.id}-title`}
      data-template={view.template}
      data-reveal=""
    >
      <Layout view={view} fallbackImage={fallbackImage} />
    </article>
  );
}

// Every card is two containers (owner request): a text pane and a media pane that runs the full
// height of the card. Phones stack them, text first.
function Split({ text, media, view }: { text: ReactNode; media: ReactNode | null; view: CardView }) {
  return (
    <div className={`project-card-split ${media ? "" : "project-card-split--single"}`}>
      <div className="project-card-text">{text}</div>
      {media && (
        <div className="project-card-media" style={view.colors ? { background: view.colors.surface } : undefined}>
          {media}
        </div>
      )}
    </div>
  );
}

function Layout({ view, fallbackImage }: Props) {
  const { card } = view;
  switch (card.template) {
    case "device_stage":
      return (
        <Split
          view={view}
          text={
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
          }
          media={
            <div className="project-card-media-inner flex items-center justify-center gap-4 sm:gap-6">
              {card.payload.screens.map((screen, index) => (
                <Media
                  key={screen.url + index}
                  media={mediaView({ fit: "contain", ...screen }, screenRatio())}
                  className={screen.width && screen.height && screen.width >= screen.height ? "w-[46%] max-w-[380px]" : "w-[30%] max-w-[220px]"}
                />
              ))}
            </div>
          }
        />
      );
    case "gallery_grid": {
      const columns = galleryColumns(card.payload.items.length);
      return (
        <Split
          view={view}
          text={
            <Text view={view}>
              {card.payload.labels?.length ? (
                <ul className="mt-6 flex flex-col items-start gap-2" aria-label="Key journeys">
                  {card.payload.labels.map((label) => <li key={label} className="project-card-label">{label}</li>)}
                </ul>
              ) : null}
            </Text>
          }
          media={
            <ul className="project-card-media-inner grid content-center gap-3 sm:gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label={`${view.title} gallery`}>
              {card.payload.items.map((item, index) => (
                <li key={item.url + index} className="rounded-[12px] bg-white/70 p-2">
                  <Media media={mediaView({ fit: "contain", ...item })} />
                </li>
              ))}
            </ul>
          }
        />
      );
    }
    case "process_flow":
      return (
        <Split
          view={view}
          text={<Text view={view} />}
          media={
            <ol className="project-card-media-inner grid content-center gap-3" aria-label={`${view.title} journey`}>
              {card.payload.steps.map((step, index) => (
                <li key={step.name + index} className="project-card-step" style={{ background: "#FFFFFF", color: DEEP_FOREST }}>
                  <span className="project-card-meta">{String(index + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block type-h3">{step.name}</span>
                  {step.media ? <Media media={mediaView({ fit: "contain", ...step.media })} className="mt-3" /> : null}
                </li>
              ))}
            </ol>
          }
        />
      );
    case "statement":
      return (
        <Split
          view={view}
          text={
            <div className="grid gap-6" data-reveal-group="">
              <p className="project-card-meta">{view.label}</p>
              <p className="project-card-statement">{card.payload.statement}</p>
              <h3 id={`project-${view.id}-title`} className="type-h3">{view.title}</h3>
              <Facts view={view} />
              <Cta view={view} />
            </div>
          }
          media={card.payload.image ? <Media media={mediaView(card.payload.image)} fill /> : null}
        />
      );
    default: {
      const image = card.payload.image ?? (fallbackImage ? { url: fallbackImage, alt: `${view.title} preview` } : undefined);
      return <Split view={view} text={<Text view={view} />} media={image ? <Media media={mediaView(image)} fill /> : null} />;
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

const FACT_ICONS: Record<FactIcon, LucideIcon> = {
  role: UserRound, platform: MonitorSmartphone, status: CircleDot, stack: Layers, scope: Target,
  year: Calendar, client: Building2, duration: Clock, info: Info,
};

// Facts as icon + value (owner request). The label stays in the markup for screen readers.
function Facts({ view }: { view: CardView }) {
  if (!view.facts.length) return null;
  return (
    <dl className="project-card-facts">
      {view.facts.map((fact) => {
        const Icon = FACT_ICONS[factIcon(fact.label)];
        return (
          <div key={fact.label + fact.value} className="project-card-fact">
            <dt title={fact.label}>
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span className="sr-only">{fact.label}</span>
            </dt>
            <dd>{fact.value}</dd>
          </div>
        );
      })}
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

/**
 * The card's media container: a still image, an animated GIF or a video, chosen from the URL
 * (or the media's explicit kind). `fill` makes it cover the whole media pane; otherwise it keeps
 * the media's own aspect ratio. Images and GIFs ease in slightly on hover; GIFs are served
 * unoptimised so they stay animated; videos get their own Pause/Play control.
 */
function Media({ media, className = "", fill }: { media: CardMediaView; className?: string; fill?: boolean }) {
  const fit = media.fit ?? (fill ? "cover" : "contain");
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";
  const frame = fill ? `absolute inset-0 overflow-hidden ${className}` : `relative block overflow-hidden rounded-[12px] ${className}`;
  return (
    <div className={frame} style={fill ? undefined : { aspectRatio: media.aspectRatio }} data-media-kind={media.kind} data-parallax="">
      {media.kind === "video" ? (
        <CardVideo src={media.url} poster={media.poster} label={media.alt} fit={fit} />
      ) : (
        <Image
          src={media.url}
          alt={media.alt}
          fill
          unoptimized={media.kind === "gif"}
          sizes="(max-width: 767px) 92vw, 55vw"
          className={`${fitClass} transition-transform duration-[var(--duration-editorial)] ease-[var(--ease-standard)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
        />
      )}
    </div>
  );
}
