import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Project { id: string; title: string; slug: string; description: string; category: string; tags: string[]; coverImage: string | null }

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="selected-work" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="selected-work-title">
      <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
        <div className="grid gap-5 border-b border-border-default pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div><p className="eyebrow">Selected product work</p><h2 id="selected-work-title" className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Complex problems, made clearer.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-text-secondary">Case studies selected for product thinking, systems work, interaction detail, and implementation awareness.</p>
        </div>
        <div>
          {projects.map((project, index) => (
            <article key={project.id} className="grid gap-6 border-b border-border-subtle py-9 md:grid-cols-[4rem_1fr_1.1fr] md:gap-8 md:py-12">
              <p className="text-sm tabular-nums text-text-tertiary">0{index + 1}</p>
              <div className="flex flex-col items-start">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{project.category}</p>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{project.title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-text-secondary">{project.description}</p>
                <Link href={`/work/${project.slug}`} className="mt-7 inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent hover:underline">View case study <ArrowUpRight size={17} aria-hidden="true" /></Link>
              </div>
              <Link href={`/work/${project.slug}`} aria-label={`View ${project.title} case study`} className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-bg-tertiary">
                {project.coverImage ? <Image src={project.coverImage} alt={`${project.title} interface preview`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : null}
              </Link>
            </article>
          ))}
        </div>
        <Link href="/work" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">View all work <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
