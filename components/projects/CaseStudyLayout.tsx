"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, Calendar, Clock, User, Layers } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CaseStudySection from "./CaseStudySection";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  year: string | null;
  client: string | null;
  role: string | null;
  duration: string | null;
  tools: string[];
  overview: string | null;
  challenge: string | null;
  approach: string | null;
  results: string | null;
  testimonial: string | null;
  testimonialAuthor: string | null;
  images: { id: string; url: string; alt: string | null; caption: string | null }[];
  caseStudySections: { id: string; title: string | null; content: string; order: number }[];
}

export default function CaseStudyLayout({ project }: { project: ProjectData }) {
  return (
    <article>
      <div className="relative h-[50vh] md:h-[60vh] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-950 z-10" />
        <div className="relative z-20 text-center px-6">
          <Badge variant="primary">{project.category}</Badge>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold text-gray-900 dark:text-white max-w-3xl mx-auto">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            {project.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            {project.overview && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{project.overview}</p>
              </motion.section>
            )}

            {project.challenge && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Challenge</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{project.challenge}</p>
              </motion.section>
            )}

            {project.caseStudySections.map((section) => (
              <CaseStudySection key={section.id} section={section} />
            ))}

            {project.approach && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Approach</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{project.approach}</p>
              </motion.section>
            )}

            {project.results && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Results</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{project.results}</p>
              </motion.section>
            )}

            {project.testimonial && (
              <motion.blockquote
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <p className="text-lg text-gray-700 dark:text-gray-200 italic leading-relaxed">
                  &ldquo;{project.testimonial}&rdquo;
                </p>
                {project.testimonialAuthor && (
                  <p className="mt-4 font-semibold text-sm text-gray-900 dark:text-white">
                    — {project.testimonialAuthor}
                  </p>
                )}
              </motion.blockquote>
            )}
          </div>

          <aside className="space-y-8">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Project Info
              </h3>
              <div className="space-y-4">
                {project.client && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.client}</p>
                    </div>
                  </div>
                )}
                {project.role && (
                  <div className="flex items-start gap-3">
                    <Layers size={16} className="mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">My Role</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.role}</p>
                    </div>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.duration}</p>
                    </div>
                  </div>
                )}
                {project.year && (
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="mt-0.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Year</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{project.year}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {project.tools.length > 0 && (
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Tools Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <Badge key={tool}>{tool}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink size={16} />
                  View Live Project
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <GitBranch size={16} />
                  View Source
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
