import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import EditorialReveal from "@/components/motion/EditorialReveal";
interface Project{id:string;title:string;slug:string;description:string;category:string;tags:string[];coverImage:string|null}
export default function FeaturedProjects({projects,intro}:{projects:Project[];intro?:{eyebrow?:string;title?:string;description?:string}|null}) {
  return <section id="selected-work" className="featured-work scroll-mt-24" aria-label="Selected work">
    <div className="featured-work-shell">
      <EditorialReveal as="header">
        <p className="selected-work-label">{intro?.eyebrow || "Selected Work"}</p>
      </EditorialReveal>
      <div className="featured-projects-list">{projects.map((project,index) => <article key={project.id} className="project-row border-b border-border-default pb-20 md:pb-28">
        <EditorialReveal>
          <p className="identity-wordmark">{String(index+1).padStart(2,"0")} / {project.title}</p>
          <h3 className="mt-6 project-headline">{project.description}</h3>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="type-micro text-text-tertiary">{project.category}</p>
            {project.tags.slice(0,3).map(tag => <span key={tag} className="type-small text-text-tertiary">{tag}</span>)}
          </div>
          <Link href={`/work/${project.slug}`} className="project-link mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent">View case study <ArrowUpRight size={17} aria-hidden="true"/></Link>
        </EditorialReveal>
        {project.coverImage && <EditorialReveal evidence className="mt-10 md:mt-12">
          <Link href={`/work/${project.slug}`} aria-label={`View ${project.title} case study`} className="project-evidence group relative block aspect-[16/8] overflow-hidden bg-bg-tertiary">
            <Image src={project.coverImage} alt={`${project.title} interface preview`} fill preload={index===0} sizes="(max-width:1200px) 100vw,1200px" className="object-cover transition-transform duration-[var(--duration-editorial)] ease-[var(--ease-standard)] group-hover:scale-[1.015]"/>
          </Link>
        </EditorialReveal>}
      </article>)}</div>
      <Link href="/work" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold">View all work <ArrowUpRight size={17} aria-hidden="true"/></Link>
    </div>
  </section>;
}
