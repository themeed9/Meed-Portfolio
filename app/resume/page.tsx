import { prisma } from "@/lib/prisma";
import { fallbackResume, fallbackResumeExperiences } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import FadeIn from "@/components/effects/FadeIn";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata = generateMetadata({
  title: "Resume",
  description: "View or download Abdulhameed Abdulsalam's resume.",
});

export default async function ResumePage() {
  const resume = await prisma.resume.findFirst({ where: { active: true } }).catch(() => null) || fallbackResume;

  let experiences = fallbackResumeExperiences;
  try {
    experiences = await prisma.resumeExperience.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
  }

  return (
    <FadeIn className="pt-[var(--spacing-13)] pb-[var(--spacing-12)]">
      <div className="max-w-3xl mx-auto px-[var(--spacing-6)] text-center">
        <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
          Resume
        </span>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
          Download My Resume
        </h1>
        <p className="mt-4 text-text-tertiary max-w-md mx-auto leading-relaxed">
          Get a detailed overview of my experience, skills, and the impact I&apos;ve delivered across product design projects.
        </p>

        <div className="mt-[var(--spacing-12)] p-[var(--spacing-8)] rounded-2xl border border-border-subtle bg-surface-primary max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary-subtle flex items-center justify-center mx-auto mb-5" aria-hidden="true">
            <Download size={28} className="text-text-accent" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Abdulhameed Abdulsalam</h3>
          <p className="text-sm text-text-tertiary mb-6">Product Designer — Resume</p>
          {resume ? (
            <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" className="w-full">
                <Download size={16} aria-hidden="true" />
                Download Resume
              </Button>
            </a>
          ) : (
            <p className="text-sm text-text-tertiary">Resume not available yet. Check back soon.</p>
          )}
        </div>

        <div className="mt-[var(--spacing-12)]">
          <h2 className="text-2xl font-bold text-text-primary mb-[var(--spacing-8)]">Experience Snapshot</h2>
          <div className="space-y-[var(--spacing-8)] text-left">
            {experiences.length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-8">No experience entries yet.</p>
            ) : (
              experiences.map((exp) => (
                <div key={exp.id} className="flex gap-6">
                  <div className="hidden sm:block w-32 flex-shrink-0">
                    <p className="text-sm text-text-tertiary">{exp.year}</p>
                  </div>
                  <div className="flex-1 pb-8 border-l-2 border-border-subtle pl-6 relative">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary-base" aria-hidden="true" />
                    <p className="text-sm text-text-tertiary sm:hidden mb-1">{exp.year}</p>
                    <h3 className="font-semibold text-text-primary">{exp.title}</h3>
                    <p className="text-sm text-text-accent mb-2">{exp.company}</p>
                    <p className="text-sm text-text-tertiary leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
