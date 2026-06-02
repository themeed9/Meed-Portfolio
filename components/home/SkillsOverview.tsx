"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Palette, Camera, Video, PenTool } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const secondarySkills = [
  { title: "Brand Design", description: "Visual identity, logos, and brand systems", icon: Palette },
  { title: "Social Media Design", description: "Engaging templates and content graphics", icon: Camera },
  { title: "AI Storytelling", description: "AI-assisted video production and narratives", icon: Video },
  { title: "Marketing Design", description: "Campaigns, pitch decks, and collateral", icon: PenTool },
];

function AnimatedLine({
  children,
  className = "",
  delay = 0,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "span" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    const inner = el.querySelector(".animated-line-inner");

    gsap.fromTo(
      inner,
      { y: "100%" },
      {
        y: "0%",
        duration: 1,
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      }
    );
  }, [delay]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <Tag className="animated-line-inner block translate-y-full">
        {children}
      </Tag>
    </div>
  );
}

export default function SkillsOverview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Animate skill items with stagger
      const items = itemsRef.current?.querySelectorAll(".skill-item");
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: items[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // Animate the underline on section title
      const underlines = sectionRef.current?.querySelectorAll(".title-underline");
      if (underlines?.length) {
        gsap.fromTo(
          underlines,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.6,
            scrollTrigger: {
              trigger: underlines[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }

      // Animate the link arrow
      const arrows = sectionRef.current?.querySelectorAll(".link-arrow");
      if (arrows?.length) {
        gsap.fromTo(
          arrows,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.8,
            scrollTrigger: {
              trigger: arrows[0],
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
    <section ref={sectionRef} className="py-[var(--spacing-12)] md:py-[var(--spacing-13)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        {/* Header — AnimatedLines style */}
        <div className="max-w-xl mb-[var(--spacing-11)]">
          <AnimatedLine
            as="span"
            className="text-xs font-semibold text-primary-safe uppercase tracking-widest"
            delay={0}
          >
            More Skills
          </AnimatedLine>

          <AnimatedLine
            as="h2"
            className="mt-3 text-3xl md:text-4xl font-bold text-on-surface"
            delay={0.08}
          >
            Creative &amp; Visual Design
          </AnimatedLine>

          <AnimatedLine
            as="p"
            className="mt-[var(--spacing-4)] text-on-surface-variant leading-relaxed"
            delay={0.16}
          >
            Beyond product design, I bring brands to life through visual storytelling, social media, and AI-powered creative production.
          </AnimatedLine>

          {/* Underline accent */}
          <div className="mt-[var(--spacing-6)] h-[2px] w-12 bg-primary-safe title-underline origin-left" />
        </div>

        {/* Skills — staggered items */}
        <div ref={itemsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondarySkills.map((skill) => (
            <div
              key={skill.title}
              className="skill-item p-6 rounded-2xl border border-outline-variant bg-surface hover:shadow-2 hover:border-outline transition-all duration-300 opacity-0 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-98 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <skill.icon size={18} className="text-primary-safe" />
              </div>
              <h3 className="font-semibold text-on-surface mb-1">{skill.title}</h3>
              <p className="text-sm text-on-surface-variant">{skill.description}</p>
            </div>
          ))}
        </div>

        {/* Link — with animated arrow */}
        <div className="mt-[var(--spacing-10)] text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-safe hover:text-primary-container transition-colors cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight size={16} className="link-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
