import { prisma } from "@/lib/prisma";
import { fallbackSkills, fallbackAbout, fallbackResume } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import FadeIn from "@/components/effects/FadeIn";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = generateMetadata({
  title: "About",
  description: "Learn about Abdulhameed Abdulsalam, a Product Designer with 5 years of experience in AI-enhanced product design.",
});

export default async function AboutPage() {
  const aboutContent = await prisma.siteContent.findUnique({ where: { key: "homepage-about" } }).catch(() => null);
  const about = aboutContent?.value as any || fallbackAbout;
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } }).catch(() => fallbackSkills);
  const resume = await prisma.resume.findFirst({ where: { active: true } }).catch(() => null) || fallbackResume;

  const categories = [...new Set(skills.map((s: any) => s.category))] as string[];

  return (
    <FadeIn className="pt-[var(--spacing-13)] pb-[var(--spacing-12)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-12)] items-start mb-[var(--spacing-12)]">
          <div>
            <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
              About Me
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
              Product Designer &amp; AI Enthusiast
            </h1>
            {about?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="mt-4 text-text-secondary leading-relaxed">{p}</p>
            ))}
            <div className="flex flex-wrap gap-4 mt-[var(--spacing-8)]">
              <Link href="/work" className="inline-flex items-center gap-2 px-6 py-3 bg-bg-inverse text-text-inverse rounded-full text-sm font-medium hover:opacity-90 transition-all">
                View My Work
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {resume && (
                <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border-default text-text-primary rounded-full text-sm font-medium hover:border-border-strong transition-colors">
                  <Download size={16} aria-hidden="true" />
                  Download Resume
                </a>
              )}
            </div>
          </div>
          <div className="aspect-[4/5] rounded-2xl bg-surface-tertiary flex items-center justify-center" aria-hidden="true">
            <span className="text-sm text-text-tertiary">Photo</span>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-[var(--spacing-12)]">
          <h2 className="text-3xl font-bold text-text-primary mb-[var(--spacing-12)]">Skills &amp; Expertise</h2>
          <div className="space-y-[var(--spacing-12)]">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-6">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.filter((s: any) => s.category === cat).map((skill: any) => (
                    <div key={skill.id} className="p-4 rounded-xl bg-bg-secondary border border-border-subtle">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-text-primary text-sm">{skill.name}</p>
                        <span className="text-xs text-text-tertiary">{skill.proficiency}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-tertiary overflow-hidden">
                        <div className="h-full rounded-full bg-primary-base transition-all" style={{ width: `${skill.proficiency}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
