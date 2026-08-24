import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { fallbackHero } from "@/lib/defaults";

export type PublicProject = {
  id: string; title: string; slug: string; description: string; recruiterSummary: string | null;
  status: string | null; platform: string | null; category: string; tags: string[];
  coverImage: string | null; homepageImage: string | null; heroImage: string | null;
  liveUrl: string | null; githubUrl: string | null; featured: boolean; published: boolean;
  year: string | null; client: string | null; role: string | null; duration: string | null;
  tools: string[]; overview: string | null; challenge: string | null; approach: string | null;
  results: string | null; testimonial: string | null; testimonialAuthor: string | null; order: number;
  images: { id: string; url: string; alt: string | null; caption: string | null; order: number }[];
  caseStudySections: { id: string; type?: string | null; title: string | null; eyebrow?: string | null; content: string; payload?: unknown; metadata?: unknown; imageUrl?: string | null; imageAlt?: string | null; order: number }[];
};

const baseSelect = {
  id: true, title: true, slug: true, description: true, category: true, tags: true,
  coverImage: true, liveUrl: true, githubUrl: true, featured: true, published: true,
  year: true, client: true, role: true, duration: true, tools: true, overview: true,
  challenge: true, approach: true, results: true, testimonial: true,
  testimonialAuthor: true, order: true,
  images: { orderBy: { order: "asc" as const }, select: { id: true, url: true, alt: true, caption: true, order: true } },
};

function legacyProject(project: Record<string, unknown>): PublicProject {
  return { ...project, recruiterSummary: null, status: null, platform: null, homepageImage: null, heroImage: null, caseStudySections: (project.caseStudySections as PublicProject["caseStudySections"] | undefined) ?? [] } as PublicProject;
}

export const getPublishedProjects = cache(async (): Promise<PublicProject[]> => {
  try {
    const projects = await prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { images: { orderBy: { order: "asc" } }, caseStudySections: { orderBy: { order: "asc" } } } });
    if (!projects.length && process.env.NODE_ENV === "development") return (await import("@/lib/dev-portfolio-fixtures")).developmentProjects;
    return projects;
  } catch {
    const rows = await prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" }, select: baseSelect }).catch(() => []);
    const projects = rows.map((row) => legacyProject(row));
    if (!projects.length && process.env.NODE_ENV === "development") return (await import("@/lib/dev-portfolio-fixtures")).developmentProjects;
    return projects;
  }
});

export const getPublishedProject = cache(async (slug: string): Promise<PublicProject | null> => {
  try {
    const project = await prisma.project.findFirst({ where: { slug, published: true }, include: { images: { orderBy: { order: "asc" } }, caseStudySections: { orderBy: { order: "asc" } } } });
    if (!project && process.env.NODE_ENV === "development") return (await import("@/lib/dev-portfolio-fixtures")).developmentProjects.find(item => item.slug === slug) ?? null;
    return project;
  } catch {
    const row = await prisma.project.findFirst({ where: { slug, published: true }, select: { ...baseSelect, caseStudySections: { orderBy: { order: "asc" as const }, select: { id: true, title: true, content: true, imageUrl: true, imageAlt: true, order: true } } } }).catch(() => null);
    if (row) return legacyProject(row);
    if (process.env.NODE_ENV === "development") return (await import("@/lib/dev-portfolio-fixtures")).developmentProjects.find(project => project.slug === slug) ?? null;
    return null;
  }
});

export const resolvePublishedProject = cache(async (slug: string): Promise<PublicProject | null> => {
  const exact = await getPublishedProject(slug);
  if (exact) return exact;
  const prefix = `${slug}-`;
  const matches = (await getPublishedProjects()).filter((project) => project.slug.startsWith(prefix));
  return matches.length === 1 ? matches[0] : null;
});

export const getSiteContent = cache(async <T>(key: string): Promise<T | null> => {
  const entry = await prisma.siteContent.findUnique({ where: { key } }).catch(() => null);
  const stored = entry?.value && typeof entry.value === "object" ? (entry.value as object) : {};
  if (process.env.NODE_ENV === "development") {
    const fixture = (await import("@/lib/dev-portfolio-fixtures")).developmentContent[key];
    if (fixture || entry?.value) return { ...(fixture ?? {}), ...stored } as T;
  }
  if (entry?.value && typeof entry.value === "object") {
    if (key === "homepage-hero") return { ...fallbackHero, ...stored } as T;
    return entry.value as T;
  }
  return null;
});

export const getSkills = cache(async () => prisma.skill.findMany({ orderBy: { order: "asc" } }).catch(() => []));
export const getSocialLinks = cache(async () => prisma.socialLink.findMany({ orderBy: { order: "asc" } }).catch(() => []));
export const getResume = cache(async () => prisma.resume.findFirst({ where: { active: true } }).catch(() => null));
export const getResumeExperiences = cache(async () => prisma.resumeExperience.findMany({ orderBy: { order: "asc" } }).catch(() => []));
