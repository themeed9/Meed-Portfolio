import { notFound } from "next/navigation";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";
import { getPublishedProject } from "@/lib/portfolio-content";
import { generateMetadata as genMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const project=await getPublishedProject(slug); return project ? genMeta({title:project.title,description:project.recruiterSummary||project.description,slug:`work/${slug}`}):{}; }
export default async function ProjectDetailPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const project=await getPublishedProject(slug); if(!project) notFound(); return <CaseStudyLayout project={{...project,coverImage:project.heroImage||project.coverImage}} />; }
