import { prisma } from "@/lib/prisma";
import { fallbackHero, fallbackWorkflow, fallbackProjects, fallbackTestimonials } from "@/lib/defaults";
import Hero from "@/components/home/Hero";
import ValueProposition from "@/components/home/ValueProposition";
import Marquee from "@/components/effects/Marquee";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import AiWorkflow from "@/components/home/AiWorkflow";
import SkillsOverview from "@/components/home/SkillsOverview";
import TestimonialSection from "@/components/home/TestimonialSection";
import CtaSection from "@/components/home/CtaSection";

export const dynamic = "force-dynamic";

const marqueeItems = [
  "Product Design",
  "UI/UX",
  "Design Systems",
  "AI-First",
  "Prototyping",
  "User Research",
  "Interaction Design",
  "Design Tokens",
];

export default async function HomePage() {
  const [heroContent, projects, workflowContent, testimonials, siteSettings] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: "homepage-hero" } }).catch(() => null),
    prisma.project.findMany({ where: { featured: true, published: true }, orderBy: { order: "asc" }, take: 4 }).catch(() => fallbackProjects.filter(p => p.featured)),
    prisma.siteContent.findUnique({ where: { key: "homepage-workflow" } }).catch(() => null),
    prisma.testimonial.findMany({ where: { featured: true }, orderBy: { order: "asc" }, take: 3 }).catch(() => fallbackTestimonials.filter(t => t.featured)),
    prisma.siteContent.findUnique({ where: { key: "site-settings" } }).catch(() => null),
  ]);

  const hero = heroContent?.value as any || fallbackHero;
  const workflow = workflowContent?.value as any || fallbackWorkflow;
  const settings = siteSettings?.value as Record<string, unknown> | undefined;
  const ctaBgUrl = (settings?.ctaBgImage as string) || null;

  return (
    <>
      <Hero content={hero} />
      <Marquee items={marqueeItems} />
      <ValueProposition />
      <FeaturedProjects projects={projects} />
      {workflow && <AiWorkflow content={workflow} />}
      <Marquee items={marqueeItems} speed={25} />
      <SkillsOverview />
      <TestimonialSection testimonials={testimonials} />
      <CtaSection ctaBgUrl={ctaBgUrl} />
    </>
  );
}
