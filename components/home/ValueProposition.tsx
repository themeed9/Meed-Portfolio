"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ValueProposition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll(".vp-word");

    gsap.fromTo(
      words,
      { y: "100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.04,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const text = "I help startups ship products 3x faster";
  const words = text.split(" ");

  return (
    <section className="py-[var(--spacing-14)] md:py-[var(--spacing-15)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div ref={ref} className="max-w-4xl mx-auto text-center overflow-hidden">
          <h2 className="text-4xl md:text-6xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)] text-on-surface">
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="vp-word inline-block translate-y-full">
                  {word}
                </span>
                {i < words.length - 1 && "\u00A0"}
              </span>
            ))}
          </h2>
          <p className="mt-[var(--spacing-6)] text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            From concept to launch, I design and build digital products that
            users love and businesses trust. AI-first approach, pixel-perfect execution.
          </p>
        </div>
      </div>
    </section>
  );
}
