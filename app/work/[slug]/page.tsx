import { notFound, permanentRedirect } from "next/navigation";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";
import { resolvePublishedProject } from "@/lib/portfolio-content";
import { generateMetadata as genMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const project=await resolvePublishedProject(slug); return project ? genMeta({title:project.title,description:project.recruiterSummary||project.description,slug:`work/${project.slug}`}):{}; }
export default async function ProjectDetailPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const project=await resolvePublishedProject(slug); if(!project) notFound(); if(project.slug!==slug) permanentRedirect(`/work/${project.slug}`); return <CaseStudyLayout project={{...project,coverImage:project.heroImage||project.coverImage}} />; }
