import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps { project: { id: string; title: string; slug: string; description: string; category: string; tags: string[]; coverImage: string | null } }

export default function ProjectCard({ project }: ProjectCardProps) {
  return <article className="group border-b border-border-subtle py-9 first:border-t md:py-12">
    <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)] md:items-center md:gap-12">
      <div><p className="type-micro uppercase tracking-[0.14em] text-text-tertiary">{project.category}</p><h2 className="mt-3 type-h2">{project.title}</h2><p className="mt-4 max-w-xl type-body text-text-secondary">{project.description}</p><ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2" aria-label="Project capabilities">{project.tags.slice(0, 4).map(tag => <li key={tag} className="type-small text-text-tertiary">{tag}</li>)}</ul><Link href={`/work/${project.slug}`} className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-text-accent">Read case study <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
      <Link href={`/work/${project.slug}`} aria-label={`Read ${project.title} case study`} className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] bg-bg-tertiary">{project.coverImage && <Image src={project.coverImage} alt={`${project.title} project preview`} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover transition-transform duration-[var(--motion-slow)] group-hover:scale-[1.02]" />}</Link>
    </div>
  </article>;
}
