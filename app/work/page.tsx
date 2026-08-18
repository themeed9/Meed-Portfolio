import ProjectCard from "@/components/projects/ProjectCard";
import { getPublishedProjects, getSiteContent } from "@/lib/portfolio-content";
import { generateMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = generateMetadata({ title: "Selected Product Work", description: "Product design case studies.", slug: "work" });
type WorkIntro = { eyebrow?:string; title:string; description:string; supportingTitle?:string };

export default async function WorkPage() {
  const [projects, intro] = await Promise.all([getPublishedProjects(), getSiteContent<WorkIntro>("work-page")]);
  const featured = projects.filter(project => project.featured);
  const supporting = projects.filter(project => !project.featured);
  return <div className="page-pad"><div className="shell">{intro && <><p className="eyebrow">{intro.eyebrow}</p><div className="mt-4 grid gap-6 border-b border-border-default pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end"><h1 className="type-h1">{intro.title}</h1><p className="type-body-lg text-text-secondary">{intro.description}</p></div></>}
    <div className="mt-12">{featured.map(project => <ProjectCard key={project.id} project={{...project,coverImage:project.homepageImage||project.coverImage,description:project.recruiterSummary||project.description}} />)}</div>
    {supporting.length > 0 && <section className="mt-20" aria-labelledby="supporting-work"><p className="eyebrow">Supporting work</p>{intro?.supportingTitle && <h2 id="supporting-work" className="mt-3 type-h2">{intro.supportingTitle}</h2>}<div className="mt-8">{supporting.map(project => <ProjectCard key={project.id} project={{...project,coverImage:project.homepageImage||project.coverImage,description:project.recruiterSummary||project.description}} />)}</div></section>}
    {projects.length === 0 && <p className="type-body text-text-secondary">No published projects yet.</p>}
  </div></div>;
}
