import ProjectCard from "@/components/projects/cards/ProjectCard";
import { buildCardView, type CardProjectInput } from "@/lib/project-card-view";

// Selected work renders each project through its typed homepage card (ADR-010 phase 4).
// Projects without card data fall back to the media split layout.
type FeaturedProject = CardProjectInput & { tags?: string[] };

export default function FeaturedProjects({ projects, intro }: { projects: FeaturedProject[]; intro?: { eyebrow?: string; title?: string; description?: string } | null }) {
  return (
    <section id="selected-work" className="featured-work scroll-mt-24" aria-labelledby="selected-work-title">
      <div className="featured-work-shell">
        <h2 id="selected-work-title" className="selected-work-label">{intro?.eyebrow || "Selected Work"}</h2>
      </div>
      <div className="featured-projects-list">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} view={buildCardView(project, index)} fallbackImage={project.homepageImage || project.coverImage} />
        ))}
      </div>
    </section>
  );
}
