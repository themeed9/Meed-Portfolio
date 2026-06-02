import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fallbackProjects } from "@/lib/defaults";
import { generateMetadata as genMeta } from "@/lib/seo";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({ where: { slug } }).catch(() => null) || fallbackProjects.find((p: any) => p.slug === slug) || null;
  if (!project) return {};
  return genMeta({ title: project.title, description: project.description, slug: `work/${slug}` });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { order: "asc" } }, caseStudySections: { orderBy: { order: "asc" } } },
  }).catch(() => null) || fallbackProjects.find((p: any) => p.slug === slug) || null;

  if (!project) notFound();

  return <CaseStudyLayout project={project} />;
}
