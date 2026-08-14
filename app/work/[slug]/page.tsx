import { notFound } from "next/navigation";
import { fallbackProjects } from "@/lib/defaults";
import { generateMetadata as genMeta } from "@/lib/seo";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = fallbackProjects.find((p) => p.slug === slug) || null;
  if (!project) return {};
  return genMeta({ title: project.title, description: project.description, slug: `work/${slug}` });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = fallbackProjects.find((p) => p.slug === slug) || null;

  if (!project) notFound();

  return <CaseStudyLayout project={project} />;
}
