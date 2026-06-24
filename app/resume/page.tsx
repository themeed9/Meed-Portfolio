import { prisma } from "@/lib/prisma";
import { fallbackResume, fallbackResumeExperiences, fallbackResumeSummary, fallbackResumeCompetencies, fallbackResumeTools, fallbackResumeEducation, fallbackResumeCertifications } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import FadeIn from "@/components/effects/FadeIn";
import { Download, CheckCircle, Award, GraduationCap } from "lucide-react";
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
    const dbExperiences = await prisma.resumeExperience.findMany({
      orderBy: { order: "asc" },
    });
    if (dbExperiences.length > 0) experiences = dbExperiences;
  } catch {
  }

  return (
    <FadeIn className="pt-[var(--spacing-13)] pb-[var(--spacing-12)]">
      <div className="max-w-3xl mx-auto px-[var(--spacing-6)]">
        <div className="text-center">
          <span className="text-xs font-semibold text-text-accent uppercase tracking-widest">
            Resume
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-text-primary">
            Abdulhameed Abdulsalam
          </h1>
          <p className="mt-2 text-text-accent font-medium">
            Product Designer (UI/UX Designer)
          </p>
          <p className="text-text-tertiary text-sm mt-1">
            Lagos, Nigeria
          </p>
        </div>

        <div className="mt-[var(--spacing-8)] flex justify-center">
          {resume ? (
            <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg">
                <Download size={16} aria-hidden="true" />
                Download Resume PDF
              </Button>
            </a>
          ) : (
            <p className="text-sm text-text-tertiary">Resume not available yet. Check back soon.</p>
          )}
        </div>

        {/* Professional Summary */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-4">Professional Summary</h2>
          <p className="text-text-tertiary leading-relaxed">{fallbackResumeSummary}</p>
        </section>

        {/* Core Competencies */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-4">Core Competencies</h2>
          <div className="flex flex-wrap gap-2">
            {fallbackResumeCompetencies.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-subtle text-sm text-text-accent"
              >
                <CheckCircle size={14} />
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-4">Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fallbackResumeTools.map((tool) => (
              <div
                key={tool.name}
                className="p-3 rounded-xl bg-surface-primary border border-border-subtle"
              >
                <p className="font-medium text-text-primary text-sm">{tool.name}</p>
                <p className="text-xs text-text-tertiary">{tool.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-[var(--spacing-8)]">Experience</h2>
          <div className="space-y-[var(--spacing-8)]">
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
        </section>

        {/* Education */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-4">Education</h2>
          <div className="space-y-4">
            {fallbackResumeEducation.map((edu) => (
              <div
                key={edu.degree}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface-primary border border-border-subtle"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0">
                  <GraduationCap size={20} className="text-text-accent" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{edu.degree}</p>
                  <p className="text-sm text-text-tertiary">{edu.school}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certification */}
        <section className="mt-[var(--spacing-12)]">
          <h2 className="text-xl font-bold text-text-primary mb-4">Certification</h2>
          <div className="space-y-4">
            {fallbackResumeCertifications.map((cert) => (
              <div
                key={cert.name}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface-primary border border-border-subtle"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0">
                  <Award size={20} className="text-text-accent" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{cert.name}</p>
                  <p className="text-sm text-text-tertiary">{cert.issuer} &middot; {cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </FadeIn>
  );
}
