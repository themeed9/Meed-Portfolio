import { prisma } from "@/lib/prisma";
import { fallbackSkills, fallbackAbout, fallbackResume } from "@/lib/defaults";
import { generateMetadata } from "@/lib/seo";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { ArrowRight, Download } from "lucide-react";

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
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              About Me
            </span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Product Designer &amp; AI Enthusiast
            </h1>
            {about?.paragraphs?.map((p: string, i: number) => (
              <p key={i} className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{p}</p>
            ))}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/work" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                View My Work
                <ArrowRight size={16} />
              </Link>
              {resume && (
                <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <Download size={16} />
                  Download Resume
                </a>
              )}
            </div>
          </div>
          <div className="aspect-[4/5] rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-sm text-gray-400 dark:text-gray-600">Photo</span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-24">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Skills &amp; Expertise</h2>
          <div className="space-y-12">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">{cat}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skills.filter((s: any) => s.category === cat).map((skill: any) => (
                    <div key={skill.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{skill.name}</p>
                        <span className="text-xs text-gray-400">{skill.proficiency}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600 dark:bg-blue-400 transition-all" style={{ width: `${skill.proficiency}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
