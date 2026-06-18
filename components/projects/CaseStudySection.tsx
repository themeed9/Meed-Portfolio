"use client";

import { motion } from "framer-motion";

interface CaseStudySectionProps {
  section: {
    id: string;
    title: string | null;
    content: string;
    order: number;
  };
}

export default function CaseStudySection({ section }: CaseStudySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {section.title && (
        <h2 className="text-2xl font-bold text-text-primary mb-4">{section.title}</h2>
      )}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        {section.content.split("\n").map((line, i) => {
          if (line.startsWith("## ")) {
            return <h3 key={i} className="text-xl font-semibold text-text-primary mt-6 mb-3">{line.replace("## ", "")}</h3>;
          }
          if (line.startsWith("### ")) {
            return <h4 key={i} className="text-lg font-semibold text-text-primary mt-4 mb-2">{line.replace("### ", "")}</h4>;
          }
          if (line.startsWith("- **")) {
            const match = line.match(/- \*\*(.+?)\*\*(.*)/);
            if (match) {
              return (
                <p key={i} className="text-text-secondary leading-relaxed mb-2">
                  <strong className="text-text-primary">{match[1]}</strong>{match[2]}
                </p>
              );
            }
          }
          if (line.startsWith("- ")) {
            return <li key={i} className="text-text-secondary ml-4 mb-1">{line.replace("- ", "")}</li>;
          }
          if (line.trim() === "") return <div key={i} className="h-2" />;
          return <p key={i} className="text-text-secondary leading-relaxed mb-3">{line}</p>;
        })}
      </div>
    </motion.section>
  );
}
