import { prisma } from "@/lib/prisma";
import { fallbackResume } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata = generateMetadata({
  title: "Resume",
  description: "View or download Abdulhameed Abdulsalam's resume.",
});

export default async function ResumePage() {
  const resume = await prisma.resume.findFirst({ where: { active: true } }).catch(() => null) || fallbackResume;

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
          Resume
        </span>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Download My Resume
        </h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
          Get a detailed overview of my experience, skills, and the impact I&apos;ve delivered across product design projects.
        </p>

        <div className="mt-12 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-5">
            <Download size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Abdulhameed Abdulsalam</h3>
          <p className="text-sm text-gray-500 mb-6">Product Designer — Resume</p>
          {resume ? (
            <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg" className="w-full">
                <Download size={16} />
                Download Resume
              </Button>
            </a>
          ) : (
            <p className="text-sm text-gray-400">Resume not available yet. Check back soon.</p>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Experience Snapshot</h2>
          <div className="space-y-8 text-left">
            {[
              { year: "2024 - Present", title: "Senior Product Designer", company: "Freelance / Studio", description: "Leading product design for SaaS, fintech, and e-commerce clients. Specializing in AI-enhanced design workflows and design systems." },
              { year: "2022 - 2024", title: "Product Designer", company: "Digital Agency", description: "Designed and shipped 20+ digital products across fintech, healthcare, and enterprise SaaS. Built and maintained component libraries." },
              { year: "2021 - 2022", title: "UI/UX Designer", company: "Startup", description: "Owned the end-to-end design process for a B2B analytics platform. Grew the user base from 1K to 15K users through UX improvements." },
              { year: "2020 - 2021", title: "Junior Designer", company: "Creative Studio", description: "Started career designing brand identities, marketing materials, and social media content for small businesses and startups." },
            ].map((exp, i) => (
              <div key={i} className="flex gap-6">
                <div className="hidden sm:block w-32 flex-shrink-0">
                  <p className="text-sm text-gray-400">{exp.year}</p>
                </div>
                <div className="flex-1 pb-8 border-l-2 border-gray-100 dark:border-gray-800 pl-6 relative">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  <p className="text-sm text-gray-400 sm:hidden mb-1">{exp.year}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
