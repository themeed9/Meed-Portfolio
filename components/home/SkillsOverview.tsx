"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Palette, Camera, Video, PenTool } from "lucide-react";
import { fadeInUp, staggerContainer, easeEntrance } from "@/lib/motion";

const secondarySkills = [
  { title: "Brand Design", description: "Visual identity, logos, and brand systems", icon: Palette },
  { title: "Social Media Design", description: "Engaging templates and content graphics", icon: Camera },
  { title: "AI Storytelling", description: "AI-assisted video production and narratives", icon: Video },
  { title: "Marketing Design", description: "Campaigns, pitch decks, and collateral", icon: PenTool },
];

function SkillRow({
  skill,
  index,
}: {
  skill: (typeof secondarySkills)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 60%"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  const borderProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const borderColor = useTransform(
    borderProgress,
    [0, 1],
    ["rgba(0,0,0,0.06)", "rgba(0,0,0,0.12)"]
  );

  return (
    <motion.div
      ref={ref}
      style={{ scale, borderColor }}
      className="flex items-center gap-5 p-5 rounded-xl border transition-colors duration-300 hover:border-primary-safe/30 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-primary-98 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        <skill.icon size={18} className="text-primary-safe" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-on-surface">{skill.title}</h3>
        <p className="text-sm text-on-surface-variant">{skill.description}</p>
      </div>
      <ArrowRight size={16} className="text-on-surface-variant group-hover:text-primary-safe group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
    </motion.div>
  );
}

export default function SkillsOverview() {
  return (
    <section className="py-[var(--spacing-12)] md:py-[var(--spacing-13)] overflow-hidden">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-10)] lg:gap-[var(--spacing-14)] items-start">
          {/* Left — header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeInUp}>
              <span className="text-xs font-semibold text-primary-safe uppercase tracking-widest">
                More Skills
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="mt-3 text-4xl md:text-5xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)] text-on-surface"
            >
              Creative &amp; Visual Design
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-[var(--spacing-4)] text-on-surface-variant text-lg leading-relaxed"
            >
              Beyond product design, I bring brands to life through visual storytelling, social media, and AI-powered creative production.
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeEntrance, delay: 0.4 }}
              className="mt-[var(--spacing-6)] h-[2px] w-16 bg-primary-safe origin-left"
            />
          </motion.div>

          {/* Right — skills list */}
          <div className="space-y-3">
            {secondarySkills.map((skill, index) => (
              <SkillRow key={skill.title} skill={skill} index={index} />
            ))}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="pt-3 text-center lg:text-right"
            >
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-safe hover:text-primary-container transition-colors cursor-pointer group"
              >
                <span>View All Services</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}