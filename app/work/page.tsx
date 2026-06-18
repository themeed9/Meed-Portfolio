import { prisma } from "@/lib/prisma";
import { fallbackProjects } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import ProjectCard from "@/components/projects/ProjectCard";
import FadeIn from "@/components/effects/FadeIn";

export const dynamic = "force-dynamic";

export const metadata = generateMetadata({
  title: "Work",
  description: "Explore my portfolio of product design, UI/UX, fintech, SaaS, and brand design projects.",
});

export default async function WorkPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
  }).catch(() => fallbackProjects);

  const categories = [...new Set(projects.map((p) => p.category))];

  return (
    <FadeIn className="pt-[var(--spacing-13)] pb-[var(--spacing-12)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="max-w-2xl mb-[var(--spacing-12)]">
          <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
            Portfolio
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
            Selected Work
          </h1>
          <p className="mt-4 text-text-tertiary leading-relaxed">
            A curated selection of product design, UI/UX, and brand projects spanning fintech, SaaS, e-commerce, and more.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-[var(--spacing-11)] text-text-tertiary">
            <p>No projects published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-6)]">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </FadeIn>
  );
}
