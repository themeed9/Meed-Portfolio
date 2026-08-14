import { fallbackProjects } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import ProjectCard from "@/components/projects/ProjectCard";

export const metadata = generateMetadata({
  title: "Selected Product Work",
  description: "Product design case studies across fintech, financial services, SaaS, authentication, design systems, and responsive experiences.",
  slug: "work",
});

export default function WorkPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40">
      <div className="mx-auto max-w-[var(--content-width-standard)] px-5 md:px-8">
        <p className="eyebrow">Selected work</p>
        <div className="mt-4 grid gap-6 border-b border-border-default pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <h1 className="text-5xl font-semibold tracking-[-0.04em] md:text-7xl">Product decisions, systems, and interaction detail.</h1>
          <p className="text-lg leading-8 text-text-secondary">Three case studies showing how I frame product problems, organise complexity, design responsive systems, and work close to implementation.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {fallbackProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </div>
    </div>
  );
}
