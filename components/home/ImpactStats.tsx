"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: string;
  label: string;
}

interface ImpactStatsProps {
  stats: Stat[];
}

function parseValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return { target: parseInt(match[1], 10), suffix: match[2] };
  }
  return { target: 0, suffix: value };
}

function AnimatedNumber({ value, delay = 0 }: { value: string; delay?: number }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const { target, suffix } = parseValue(value);
    if (target === 0) {
      setDisplay(value);
      return;
    }

    const obj = { val: 0 };
    let killed = false;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ref.current,
        start: "top 88%",
        once: true,
      },
    });

    tl.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      delay,
      onUpdate: () => {
        if (killed) return;
        setDisplay(Math.round(obj.val) + suffix);
      },
    });

    return () => {
      killed = true;
      tl.kill();
    };
  }, [value, delay]);

  return <span ref={ref}>{display}</span>;
}

export default function ImpactStats({ stats }: ImpactStatsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Title line reveal
      const titleEl = sectionRef.current?.querySelector(".stat-title");
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

      // Bento cards stagger
      const items = sectionRef.current?.querySelectorAll(".bento-card");
      if (items?.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: items[0],
              start: "top 88%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Bento grid: 2-col mobile, 3-col desktop
  // 50+ = wide left, 5+ = tall right, 30+ = standard, 98% = wide
  const gridConfig = [
    { className: "col-span-2 md:col-span-2 min-h-[180px] md:min-h-[240px] bg-inverse-surface text-inverse-on-surface" },
    { className: "col-span-1 min-h-[160px] md:min-h-[240px] bg-surface-container-low text-on-surface" },
    { className: "col-span-1 min-h-[160px] md:min-h-[240px] bg-surface-container text-on-surface" },
    { className: "col-span-2 min-h-[180px] md:min-h-[220px] bg-primary-container text-on-primary-container" },
  ];

  return (
    <section ref={sectionRef} className="py-[var(--spacing-12)] md:py-[var(--spacing-13)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        {/* Section title */}
        <div className="mb-[var(--spacing-10)] md:mb-[var(--spacing-12)] text-center">
          <div className="overflow-hidden">
            <h2 className="stat-title block text-5xl md:text-7xl lg:text-[var(--font-size-display-lg)] font-bold leading-[var(--line-height-display)] text-on-surface translate-y-full">
              Impact by the Numbers
            </h2>
          </div>
          <p className="mt-[var(--spacing-4)] text-on-surface-variant text-lg max-w-xl mx-auto">
            Measurable results from projects delivered to startups and enterprises across multiple industries.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--spacing-4)] md:gap-[var(--spacing-5)]">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`bento-card rounded-2xl border border-outline-variant opacity-0 flex flex-col justify-end p-[var(--spacing-6)] md:p-[var(--spacing-8)] transition-shadow duration-300 hover:shadow-2 ${gridConfig[i]?.className || ""}`}
            >
              <p className={`font-bold leading-none ${
                i === 0 || i === 3
                  ? "text-6xl md:text-7xl lg:text-[var(--font-size-display-sm)]"
                  : "text-5xl md:text-6xl"
              }`}>
                <AnimatedNumber value={stat.value} delay={i * 0.1} />
              </p>
              <p className="mt-[var(--spacing-3)] text-sm opacity-70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
