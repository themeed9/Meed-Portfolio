"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll(".cta-word");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        once: true,
      },
    });

    tl.fromTo(
      words,
      { y: "100%", opacity: 0 },
      { y: "0%", opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.04 }
    );

    tl.fromTo(
      el.querySelector(".cta-sub"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    );

    tl.fromTo(
      el.querySelector(".cta-button"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.3"
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const text = "Let's Build Something Great Together";
  const words = text.split(" ");

  return (
    <section className="py-[var(--spacing-14)] md:py-[var(--spacing-15)]">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] text-center">
        <div ref={ref}>
          <h2 className="text-3xl md:text-5xl lg:text-[var(--font-size-display-md)] font-bold leading-[var(--line-height-display)] text-on-surface">
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span className="cta-word inline-block translate-y-full">
                  {word}
                </span>
                {i < words.length - 1 && "\u00A0"}
              </span>
            ))}
          </h2>
          <p className="cta-sub mt-[var(--spacing-4)] text-lg text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Have a project in mind? Let&apos;s talk about how I can help bring your vision to life.
          </p>
          <Link
            href="/contact"
            className="cta-button inline-flex items-center gap-2 mt-[var(--spacing-8)] px-8 py-3.5 bg-on-surface text-surface rounded-[var(--radius-md)] text-sm font-medium hover:bg-on-surface/90 transition-colors cursor-pointer"
          >
            Start a Conversation
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
