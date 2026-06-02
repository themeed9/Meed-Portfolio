"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Big title line reveal
      const titleLines = sectionRef.current?.querySelectorAll(".title-line");
      if (titleLines?.length) {
        gsap.fromTo(
          titleLines,
          { y: "100%" },
          {
            y: "0%",
            duration: 1,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: titleLines[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // Project items stagger
      const items = sectionRef.current?.querySelectorAll(".project-item");
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: {
              trigger: items[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-[var(--spacing-12)] md:py-[var(--spacing-13)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        {/* Big section title — Richard style */}
        <div className="mb-[var(--spacing-8)] md:mb-[var(--spacing-10)] text-center">
          <div className="overflow-hidden">
            <h2 className="title-line block text-5xl md:text-7xl lg:text-[var(--font-size-display-lg)] font-bold leading-[var(--line-height-display)] text-on-surface translate-y-full">
              Selected Work
            </h2>
          </div>
          <p className="mt-[var(--spacing-4)] text-on-surface-variant text-lg max-w-xl mx-auto">
            A curated collection of product design, UI/UX, and brand projects I&apos;ve crafted from concept to launch.
          </p>
        </div>

        {/* Projects — full-width image + text below */}
        <div className="space-y-[var(--spacing-14)] md:space-y-[var(--spacing-15)]">
          {projects.map((project) => (
            <div key={project.id} className="project-item opacity-0">
              <Link href={`/work/${project.slug}`} className="group block cursor-pointer">
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl bg-surface-container-low">
                  <div className="relative aspect-[21/9] overflow-hidden">
                    {project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        sizes="(max-width: 768px) 100vw, 100vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                        <span className="text-on-surface-variant text-sm">{project.title}</span>
                      </div>
                    )}

                    {/* Hover overlay — richardekwonye style: dark scrim + project info + CTA */}
                    <div className="absolute inset-0 bg-[var(--color-neutral-0)]/0 group-hover:bg-[var(--color-neutral-0)]/60 transition-colors duration-500 flex items-center justify-center">
                      <div className="translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out text-center px-6">
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                          {project.category}
                        </span>
                        <h3 className="mt-2 text-xl md:text-2xl font-bold text-white">
                          {project.title}
                        </h3>
                        <span className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--color-neutral-10)] rounded-full text-sm font-medium">
                          View Project
                          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text below image */}
                <div className="mt-[var(--spacing-6)] md:mt-[var(--spacing-8)]">
                  <span className="text-xs font-semibold text-primary-safe uppercase tracking-widest">
                    {project.category}
                  </span>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold text-on-surface">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-on-surface-variant leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-on-surface group-hover:text-primary-safe transition-colors duration-300">
                    View Project
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-[var(--spacing-12)] md:mt-[var(--spacing-14)] text-center">
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 text-lg md:text-xl font-semibold text-on-surface hover:text-primary-safe transition-colors cursor-pointer"
          >
            View All Projects
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
