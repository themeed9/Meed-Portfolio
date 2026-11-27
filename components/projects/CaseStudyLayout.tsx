import Image from "next/image";
import type { CSSProperties } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CaseStudySection from "./CaseStudySection";
import { caseStudyLength, contentsEntries, convertedLegacyFields, readBlockSettings } from "@/lib/case-study-blocks";
import { cardColors } from "@/lib/project-card-view";

// Case-study page (ADR-003 blocks + ADR-011 CMS layer). Everything below the header is composed in
// the admin from blocks. The legacy Overview and Challenge text still renders, with its old
// headings, until it has been converted into blocks; after that the blocks own it.

type Section = { id: string; type?: string | null; title: string | null; eyebrow?: string | null; content: string; payload?: unknown; metadata?: unknown; imageUrl?: string | null; imageAlt?: string | null; order: number };

export interface ProjectData {
  id: string; title: string; slug?: string; description: string; category: string; tags: string[];
  coverImage: string | null; liveUrl: string | null; githubUrl: string | null;
  year: string | null; client: string | null; role: string | null; duration: string | null; tools: string[];
  overview: string | null; challenge: string | null; primaryColor?: string | null;
  images: { id: string; url: string; alt: string | null; caption: string | null }[];
  caseStudySections: Section[];
}

type Props = { project: ProjectData; preview?: boolean; nextProject?: { title: string; slug: string } | null };

export default function CaseStudyLayout({ project, preview = false, nextProject = null }: Props) {
  const sections = preview ? project.caseStudySections : project.caseStudySections.filter((section) => !readBlockSettings(section.metadata).hidden);
  const converted = convertedLegacyFields(project.caseStudySections);
  const overview = converted.includes("overview") ? null : project.overview;
  const challenge = converted.includes("challenge") ? null : project.challenge;
  // Same calculation as the admin meter, so the page and the editor always agree.
  const { minutes } = caseStudyLength(project.caseStudySections, { description: project.description, overview: project.overview, challenge: project.challenge });
  const contents = contentsEntries(sections);
  const colors = cardColors(project.primaryColor || "#0B3D2E");
  const heroStyle = (colors ? { "--hero-bg": colors.background, "--hero-fg": colors.text } : {}) as CSSProperties;
  const facts = [["Role", project.role], ["Client", project.client], ["Duration", project.duration], ["Year", project.year], ["Read time", `${minutes} min`]]
    .filter((item): item is [string, string] => Boolean(item[1]));
  const jsonLd = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, dateCreated: project.year || undefined, keywords: project.tags.join(", "), author: { "@type": "Person", name: "Abdulhameed Abdulsalam" } };

  return (
    <article className="case-page">
      {!preview && <Script id="schema-project" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {/* Full-bleed hero in the project's colour with a large title; the cover image overlaps the
          band's lower edge and drifts as you scroll (owner request, 2026-11-27). Text uses the
          auto-picked AA colour for the band. */}
      <header className="case-hero" style={heroStyle}>
        <div className="case-hero-band">
          <div className="shell case-hero-inner">
            <p className="case-hero-eyebrow">{project.category}</p>
            <h1 className="case-hero-title">{project.title}</h1>
            <p className="case-hero-intro">{project.description}</p>
            {/* Recruiters can see the real product straight away (owner, 2026-11-25). */}
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="case-hero-cta">View live project <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
          </div>
        </div>
        <div className="shell">
          {project.coverImage && <div className="case-hero-media" data-parallax=""><Image src={project.coverImage} alt={`${project.title} product interface`} fill preload sizes="(max-width:1200px) 100vw,1200px" className="object-cover" /></div>}
          <dl className={`case-hero-facts ${project.coverImage ? "" : "case-hero-facts--flush"}`}>
            {facts.map(([label, value]) => <div key={label}><dt className="type-micro text-text-tertiary">{label}</dt><dd className="mt-1 type-small font-semibold">{value}</dd></div>)}
            {project.tags.length > 0 && <div className="case-hero-facts-wide"><dt className="type-micro text-text-tertiary">Contribution</dt><dd className="mt-1 type-small text-text-secondary">{project.tags.join(" · ")}</dd></div>}
            {project.tools.length > 0 && <div className="case-hero-facts-wide"><dt className="type-micro text-text-tertiary">Tools</dt><dd className="mt-1 type-small text-text-secondary">{project.tools.join(" · ")}</dd></div>}
          </dl>
        </div>
      </header>

      <div className="shell mt-16">
        {contents.length >= 3 && (
          <nav className="case-contents" aria-label="On this page">
            <p className="type-micro text-text-tertiary">On this page</p>
            <ol>{contents.map((entry) => <li key={entry.id}><a href={`#${entry.id}`}>{entry.label}</a></li>)}</ol>
          </nav>
        )}
        {overview && <section className="case-legacy mt-16"><p className="eyebrow">Overview</p><h2 className="mt-4 type-h2">The product in context.</h2><p className="mt-6 type-body-lg text-text-secondary">{overview}</p></section>}
        {challenge && <section className="case-legacy mt-24"><p className="eyebrow">The tension</p><h2 className="mt-4 type-h2">The product challenge.</h2><p className="mt-6 type-body text-text-secondary">{challenge}</p></section>}
        <div className="case-study-stream mt-20">
          {sections.map((section, index) => <CaseStudySection key={section.id} section={section} preview={preview} index={index} colors={colors ? { background: colors.background, text: colors.text, surface: colors.surface } : null} />)}
        </div>
        {project.images.length > 0 && (
          <section className="mt-28"><p className="eyebrow">Additional evidence</p>
            <div className="mt-6 grid gap-8 md:grid-cols-2">{project.images.map((image) => <figure key={image.id}><div className="project-evidence relative aspect-[16/10] overflow-hidden bg-bg-tertiary"><Image src={image.url} alt={image.alt || `${project.title} project evidence`} fill sizes="(max-width:768px) 100vw,50vw" className="object-cover" /></div>{image.caption && <figcaption className="mt-3 type-small text-text-tertiary">{image.caption}</figcaption>}</figure>)}</div>
          </section>
        )}
        <footer className="mt-28 flex flex-wrap items-end justify-between gap-8 border-t border-border-default pt-10">
          <div className="flex flex-wrap gap-6">
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent">View live project <ArrowUpRight size={16} aria-hidden="true" /></a>}
            {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent">View source <ArrowUpRight size={16} aria-hidden="true" /></a>}
          </div>
          {nextProject && (
            <Link href={`/work/${nextProject.slug}`} className="case-next">
              <span className="type-micro text-text-tertiary">Next project</span>
              <span className="case-next-title">{nextProject.title} <ArrowRight size={20} aria-hidden="true" /></span>
            </Link>
          )}
        </footer>
      </div>
    </article>
  );
}
