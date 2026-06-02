import { prisma } from "@/lib/prisma";
import { fallbackProjects } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import ProjectCard from "@/components/projects/ProjectCard";

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
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Portfolio
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Selected Work
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400 leading-relaxed">
            A curated selection of product design, UI/UX, and brand projects spanning fintech, SaaS, e-commerce, and more.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No projects published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
