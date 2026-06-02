"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { getImageUrl } from "@/lib/utils";

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
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-high aspect-[16/10] mb-5">
        <div
          className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
        />
        <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant">
          <span className="text-sm">Project Image</span>
        </div>
        <div className="absolute top-4 left-4 z-20">
          <Badge variant="primary">{project.category}</Badge>
        </div>
        <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight size={16} className="text-on-surface" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-on-surface group-hover:text-primary-safe transition-colors">
        {project.title}
      </h3>
      <p className="mt-2 text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
        {project.description}
      </p>
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
