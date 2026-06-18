"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, easeEntrance } from "@/lib/motion";
import Badge from "@/components/ui/Badge";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={cardRef}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.6, ease: easeEntrance, delay: index * 0.15 },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      style={{ scale }}
      className={`w-full ${isEven ? "md:ml-0 md:mr-[15%]" : "md:ml-[15%] md:mr-0"}`}
    >
      <Link href={`/work/${project.slug}`} className="group block cursor-pointer">
        <div className="bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden transition-shadow duration-300 hover:shadow-[var(--elevation-2)]">
          <div className="relative aspect-[4/3] md:aspect-[16/10] bg-surface-container-high overflow-hidden">
            <motion.div style={{ clipPath }} className="absolute inset-0">
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              ) : (
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="text-sm text-text-tertiary">{project.title}</span>
                </div>
              )}
            </motion.div>
          </div>

          <div className="p-[var(--spacing-6)] md:p-[var(--spacing-8)] border-t border-border-subtle">
            <Badge variant="primary">{project.category}</Badge>
            <h3 className="mt-3 text-xl md:text-3xl font-bold text-text-primary group-hover:text-text-accent transition-colors leading-[var(--line-height-title)]">
              {project.title}
            </h3>
            <p className="mt-2 text-sm md:text-base text-text-secondary leading-relaxed line-clamp-2 max-w-xl">
              {project.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-text-accent group-hover:gap-3 transition-all duration-300">
              View Project
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section className="py-[var(--spacing-12)] md:py-[var(--spacing-13)] overflow-hidden">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-[var(--spacing-10)] md:mb-[var(--spacing-12)] text-center"
        >
          <motion.div variants={fadeInUp}>
            <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
              Portfolio
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="mt-2 text-5xl md:text-7xl lg:text-[var(--font-size-display-lg)] font-bold leading-[var(--line-height-display)] text-text-primary"
          >
            Selected Work
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-[var(--spacing-4)] text-text-tertiary text-lg max-w-xl mx-auto"
          >
            A curated collection of product design, UI/UX, and brand projects crafted from concept to launch.
          </motion.p>
        </motion.div>

        <div className="max-w-[60%] mx-auto space-y-[var(--spacing-10)] md:space-y-[var(--spacing-14)]">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-[var(--spacing-12)] md:mt-[var(--spacing-14)] text-center"
        >
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 text-lg md:text-xl font-semibold text-text-primary hover:text-text-accent transition-colors cursor-pointer"
          >
            View All Projects
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-2"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
