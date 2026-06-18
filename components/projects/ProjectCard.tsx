"use client";

import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    tags: string[];
    coverImage: string | null;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden transition-shadow duration-300 hover:shadow-[var(--elevation-2)]"
    >
      <div className="relative aspect-[16/10] bg-surface-container-high overflow-hidden">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-text-tertiary">{project.title}</span>
          </div>
        )}
      </div>

      <div className="p-[var(--spacing-5)] md:p-[var(--spacing-6)] border-t border-border-subtle">
        <Badge variant="primary">{project.category}</Badge>
        <h3 className="mt-3 text-xl md:text-2xl font-bold text-text-primary group-hover:text-text-accent transition-colors">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">
          {project.description}
        </p>
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
