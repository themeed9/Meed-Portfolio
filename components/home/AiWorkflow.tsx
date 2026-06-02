"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Search, Lightbulb, Pen, BarChart3, Send } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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

export default function AiWorkflow({ content }: { content: WorkflowContent }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const titleEl = sectionRef.current?.querySelector(".wf-title");
      if (titleEl) {
        gsap.fromTo(
          titleEl,
          { y: "100%" },
          {
            y: "0%",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: titleEl,
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      const sub = sectionRef.current?.querySelector(".wf-sub");
      if (sub) {
        gsap.fromTo(
          sub,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2,
            scrollTrigger: {
              trigger: sub,
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      const steps = sectionRef.current?.querySelectorAll(".workflow-step");
      if (steps?.length) {
        gsap.fromTo(
          steps,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: steps[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-[var(--spacing-12)] md:py-[var(--spacing-13)] overflow-hidden bg-inverse-surface text-inverse-on-surface">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div className="mb-[var(--spacing-14)] max-w-2xl">
          <div className="overflow-hidden">
            <h2 className="wf-title block text-5xl md:text-7xl lg:text-[var(--font-size-display-lg)] font-bold leading-[var(--line-height-display)] translate-y-full">
              My Workflow
            </h2>
          </div>
          <p className="wf-sub mt-[var(--spacing-4)] text-inverse-on-surface/80 text-lg leading-relaxed">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-[var(--spacing-8)]">
          {content.steps.map((step, index) => {
            const Icon = stepIcons[index] || Search;
            return (
              <div key={step.number} className="workflow-step opacity-0">
                <Icon size={24} className="text-inverse-on-surface/80 mb-[var(--spacing-4)]" />
                <h3 className="text-lg font-semibold text-inverse-on-surface mb-2">{step.title}</h3>
                <p className="text-sm text-inverse-on-surface/70 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
