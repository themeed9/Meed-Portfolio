import ProjectCard from "@/components/projects/cards/ProjectCard";
import CardTextReveal from "@/components/projects/cards/CardTextReveal";
import { buildCardView, type CardProjectInput } from "@/lib/project-card-view";

// Selected work renders each project through its typed homepage card (ADR-010 phase 4).
// Projects without card data fall back to the media split layout.
type FeaturedProject = CardProjectInput & { tags?: string[] };

export default function FeaturedProjects({ projects, intro }: { projects: FeaturedProject[]; intro?: { eyebrow?: string; title?: string; description?: string } | null }) {
  return (
    <section id="selected-work" className="featured-work scroll-mt-24" aria-labelledby="selected-work-title">
      {/* Title hidden visually (owner request) but kept as the section heading for screen readers. */}
      <h2 id="selected-work-title" className="sr-only">{intro?.eyebrow || "Selected work"}</h2>
      <div className="featured-projects-list">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} view={buildCardView(project, index)} fallbackImage={project.homepageImage || project.coverImage} />
        ))}
      </div>
      <CardTextReveal />
    </section>
  );
}
