import { prisma } from "@/lib/prisma";
import { fallbackHero, fallbackImpact, fallbackWorkflow, fallbackProjects, fallbackTestimonials } from "@/lib/defaults";
import Hero from "@/components/home/Hero";
import ValueProposition from "@/components/home/ValueProposition";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import ImpactStats from "@/components/home/ImpactStats";
import AiWorkflow from "@/components/home/AiWorkflow";
import SkillsOverview from "@/components/home/SkillsOverview";
import TestimonialSection from "@/components/home/TestimonialSection";
import CtaSection from "@/components/home/CtaSection";
import Marquee from "@/components/effects/Marquee";

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
  const [heroContent, projects, impactContent, workflowContent, testimonials] = await Promise.all([
    prisma.siteContent.findUnique({ where: { key: "homepage-hero" } }).catch(() => null),
    prisma.project.findMany({ where: { featured: true, published: true }, orderBy: { order: "asc" }, take: 4 }).catch(() => fallbackProjects.filter(p => p.featured)),
    prisma.siteContent.findUnique({ where: { key: "homepage-impact" } }).catch(() => null),
    prisma.siteContent.findUnique({ where: { key: "homepage-workflow" } }).catch(() => null),
    prisma.testimonial.findMany({ where: { featured: true }, orderBy: { order: "asc" }, take: 3 }).catch(() => fallbackTestimonials.filter(t => t.featured)),
  ]);

  const hero = heroContent?.value as any || fallbackHero;
  const impact = impactContent?.value as any || fallbackImpact;
  const workflow = workflowContent?.value as any || fallbackWorkflow;

  const impactStats = [impact.stat1, impact.stat2, impact.stat3, impact.stat4].filter(Boolean);

  return (
    <>
      {/* 1. HERO — Who I am */}
      <Hero content={hero} />

      {/* 2. MARQUEE — Visual divider */}
      <Marquee items={marqueeItems} />

      {/* 3. VALUE PROPOSITION — What I solve */}
      <ValueProposition />

      {/* 4. FEATURED PROJECTS — Show don't tell */}
      <FeaturedProjects projects={projects} />

      {/* 5. IMPACT STATS — Quantified results */}
      {impactStats.length > 0 && <ImpactStats stats={impactStats} />}

      {/* 6. MARQUEE — Visual divider */}
      <Marquee items={marqueeItems} speed={25} />

      {/* 7. AI WORKFLOW — How I work */}
      {workflow && <AiWorkflow content={workflow} />}

      {/* 8. SKILLS — What I bring */}
      <SkillsOverview />

      {/* 9. TESTIMONIALS — Others vouch */}
      <TestimonialSection testimonials={testimonials} />

      {/* 10. CTA — Let's build */}
      <CtaSection />
    </>
  );
}
