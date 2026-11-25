import Image from "next/image";
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
  const facts = [["Role", project.role], ["Client", project.client], ["Duration", project.duration], ["Year", project.year], ["Read time", `${minutes} min`]]
    .filter((item): item is [string, string] => Boolean(item[1]));
  const jsonLd = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, dateCreated: project.year || undefined, keywords: project.tags.join(", "), author: { "@type": "Person", name: "Abdulhameed Abdulsalam" } };

  return (
    <article className="page-pad">
      {!preview && <Script id="schema-project" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <header className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">{project.category}</p>
            <h1 className="mt-5 type-h1">{project.title}</h1>
            <p className="mt-7 max-w-3xl type-body-lg text-text-secondary">{project.description}</p>
            {/* Recruiters can see the real product straight away (owner, 2026-11-25). */}
            {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="home-button home-button-primary mt-8 gap-2">View live project <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}
          </div>
          <div className="lg:col-span-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border-subtle pt-5">
              {facts.map(([label, value]) => <div key={label}><dt className="type-micro text-text-tertiary">{label}</dt><dd className="mt-1 type-small font-semibold">{value}</dd></div>)}
              {project.tags.length > 0 && <div className="col-span-2"><dt className="type-micro text-text-tertiary">Contribution</dt><dd className="mt-1 type-small text-text-secondary">{project.tags.join(" · ")}</dd></div>}
              {project.tools.length > 0 && <div className="col-span-2"><dt className="type-micro text-text-tertiary">Tools</dt><dd className="mt-1 type-small text-text-secondary">{project.tools.join(" · ")}</dd></div>}
            </dl>
          </div>
        </div>
        {project.coverImage && <div className="project-evidence relative mt-14 aspect-[16/8] overflow-hidden bg-bg-tertiary"><Image src={project.coverImage} alt={`${project.title} product interface`} fill preload sizes="(max-width:1200px) 100vw,1200px" className="object-cover" /></div>}
      </header>

      <div className="shell mt-20">
        {contents.length >= 3 && (
          <nav className="case-contents" aria-label="On this page">
            <p className="type-micro text-text-tertiary">On this page</p>
            <ol>{contents.map((entry) => <li key={entry.id}><a href={`#${entry.id}`}>{entry.label}</a></li>)}</ol>
          </nav>
        )}
        {overview && <section className="case-legacy mt-16"><p className="eyebrow">Overview</p><h2 className="mt-4 type-h2">The product in context.</h2><p className="mt-6 type-body-lg text-text-secondary">{overview}</p></section>}
        {challenge && <section className="case-legacy mt-24"><p className="eyebrow">The tension</p><h2 className="mt-4 type-h2">The product challenge.</h2><p className="mt-6 type-body text-text-secondary">{challenge}</p></section>}
        <div className="case-study-stream mt-20">
          {sections.map((section) => <CaseStudySection key={section.id} section={section} preview={preview} colors={colors ? { background: colors.background, text: colors.text } : null} />)}
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
