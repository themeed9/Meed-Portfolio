"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Lightbulb, Pen, BarChart3, Send } from "lucide-react";
import { fadeInUp, staggerContainer, easeEntrance } from "@/lib/motion";

const stepIcons = [Search, Lightbulb, Pen, BarChart3, Send];

interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

interface WorkflowContent {
  title: string;
  description: string;
  steps: WorkflowStep[];
}

function StepCard({
  step,
  index,
  icon: Icon,
}: {
  step: WorkflowStep;
  index: number;
  icon: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 40%"],
  });

  const xOffset = useTransform(scrollYProgress, [0, 1], [index % 2 === 0 ? -40 : 40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0, 0.3, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ x: xOffset, opacity }}
      className="flex items-start gap-5"
    >
      <span className="flex-shrink-0 text-[10px] font-bold text-primary-safe tracking-wider mt-0.5">
        {step.number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <Icon size={16} className="text-primary-safe flex-shrink-0" />
          <h3 className="text-base font-semibold text-on-surface">{step.title}</h3>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function AiWorkflow({ content }: { content: WorkflowContent }) {
  return (
    <section className="py-[var(--spacing-12)] md:py-[var(--spacing-13)] overflow-hidden">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-10)] lg:gap-[var(--spacing-14)] items-start">
          {/* Left — title + description */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fadeInUp}>
              <span className="text-xs font-semibold text-primary-safe uppercase tracking-widest">
                Process
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="mt-3 text-4xl md:text-5xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)] text-on-surface"
            >
              My Workflow
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-[var(--spacing-4)] text-on-surface-variant text-lg leading-relaxed"
            >
              {content.description}
            </motion.p>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeEntrance, delay: 0.4 }}
              className="mt-[var(--spacing-6)] h-[2px] w-16 bg-primary-safe origin-left"
            />
          </motion.div>

          {/* Right — steps list */}
          <div className="space-y-[var(--spacing-7)]">
            {content.steps.map((step, index) => {
              const Icon = stepIcons[index] || Search;
              return (
                <StepCard
                  key={step.number}
                  step={step}
                  index={index}
                  icon={Icon}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}