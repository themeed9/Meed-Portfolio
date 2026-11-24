import { notFound, permanentRedirect } from "next/navigation";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";
import { getPublishedProductProjects, resolvePublishedProject } from "@/lib/portfolio-content";
import { generateMetadata as genMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await resolvePublishedProject(slug);
  if (!project) return {};
  // Share preview: the case study's hero (or cover) image with its recruiter summary.
  return genMeta({ title: project.title, description: project.recruiterSummary || project.description, slug: `work/${project.slug}`, image: project.heroImage || project.coverImage || undefined });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await resolvePublishedProject(slug);
  if (!project) notFound();
  if (project.slug !== slug) permanentRedirect(`/work/${project.slug}`);
  // "Next project" follows the CMS order of published product work and wraps around.
  const work = await getPublishedProductProjects();
  const index = work.findIndex((item) => item.id === project.id);
  const next = work.length > 1 && index >= 0 ? work[(index + 1) % work.length] : null;
  return <CaseStudyLayout project={{ ...project, coverImage: project.heroImage || project.coverImage }} nextProject={next ? { title: next.title, slug: next.slug } : null} />;
}
