"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Calendar, Clock, User, Layers } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CaseStudySection from "./CaseStudySection";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  year: string | null;
  client: string | null;
  role: string | null;
  duration: string | null;
  tools: string[];
  overview: string | null;
  challenge: string | null;
  approach: string | null;
  results: string | null;
  testimonial: string | null;
  testimonialAuthor: string | null;
  images: { id: string; url: string; alt: string | null; caption: string | null }[];
  caseStudySections: { id: string; title: string | null; content: string; order: number }[];
}

export default function CaseStudyLayout({ project }: { project: ProjectData }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "schema-project";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      description: project.description,
      dateCreated: project.year || undefined,
      keywords: project.tags.join(", "),
      author: {
        "@type": "Person",
        name: "Abdulhameed Abdulsalam",
      },
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [project]);

  return (
    <article>
      <div className="relative h-[50vh] min-h-[400px] md:h-[65vh] bg-surface-container-high overflow-hidden">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-tertiary to-surface-secondary" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
        <div className="bg-surface-primary rounded-2xl border border-border-subtle p-[var(--spacing-8)] md:p-[var(--spacing-10)] max-w-3xl">
          <Badge variant="primary">{project.category}</Badge>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold text-text-primary leading-[var(--line-height-heading)]">
            {project.title}
          </h1>
          <p className="mt-4 text-base md:text-lg text-text-secondary leading-relaxed">
            {project.description}
          </p>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {project.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {project.overview && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Overview</h2>
                <p className="text-text-secondary leading-relaxed">{project.overview}</p>
              </motion.section>
            )}

            {project.challenge && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">The Challenge</h2>
                <p className="text-text-secondary leading-relaxed">{project.challenge}</p>
              </motion.section>
            )}

            {project.caseStudySections.map((section) => (
              <CaseStudySection key={section.id} section={section} />
            ))}

            {project.approach && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Our Approach</h2>
                <p className="text-text-secondary leading-relaxed">{project.approach}</p>
              </motion.section>
            )}

            {project.results && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-primary-subtle border border-border-accent/30"
              >
                <h2 className="text-2xl font-bold text-text-primary mb-4">Results</h2>
                <p className="text-text-secondary leading-relaxed">{project.results}</p>
              </motion.section>
            )}

            {project.testimonial && (
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-surface-secondary border border-border-subtle"
              >
                <p className="text-lg text-text-secondary italic leading-relaxed">
                  &ldquo;{project.testimonial}&rdquo;
                </p>
                {project.testimonialAuthor && (
                  <p className="mt-4 font-semibold text-sm text-text-primary">
                    — {project.testimonialAuthor}
                  </p>
                )}
              </motion.blockquote>
            )}
          </div>

          <aside className="space-y-8">
            <div className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                Project Info
              </h3>
              <div className="space-y-4">
                {project.client && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="mt-0.5 text-text-tertiary" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-text-tertiary">Client</p>
                      <p className="text-sm font-medium text-text-primary">{project.client}</p>
                    </div>
                  </div>
                )}
                {project.role && (
                  <div className="flex items-start gap-3">
                    <Layers size={16} className="mt-0.5 text-text-tertiary" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-text-tertiary">My Role</p>
                      <p className="text-sm font-medium text-text-primary">{project.role}</p>
                    </div>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="mt-0.5 text-text-tertiary" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-text-tertiary">Duration</p>
                      <p className="text-sm font-medium text-text-primary">{project.duration}</p>
                    </div>
                  </div>
                )}
                {project.year && (
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="mt-0.5 text-text-tertiary" aria-hidden="true" />
                    <div>
                      <p className="text-xs text-text-tertiary">Year</p>
                      <p className="text-sm font-medium text-text-primary">{project.year}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {project.tools.length > 0 && (
              <div className="p-6 rounded-2xl bg-surface-secondary border border-border-subtle">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                  Tools Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <Badge key={tool}>{tool}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bg-inverse text-text-inverse rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  View Live Project
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-border-default text-text-primary rounded-full text-sm font-medium hover:border-border-strong transition-colors"
                >
                  <GitBranch size={16} aria-hidden="true" />
                  View Source
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
