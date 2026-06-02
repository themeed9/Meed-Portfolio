"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface TestimonialItem {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
}

export default function TestimonialSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      const cards = sectionRef.current?.querySelectorAll(".testimonial-card");
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: cards[0],
              start: "top 85%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-[var(--spacing-12)] md:py-[var(--spacing-13)] bg-surface-container-low">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)]">
        <div
          ref={headerRef}
          className="max-w-xl mb-[var(--spacing-11)] opacity-0"
        >
          <span className="text-xs font-semibold text-primary-safe uppercase tracking-widest">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-on-surface">
            What Clients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-8)]">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="testimonial-card p-8 rounded-2xl bg-surface border border-outline-variant opacity-0"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-primary-90 text-primary-90" />
                ))}
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-sm text-on-surface">{t.name}</p>
                {(t.role || t.company) && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {[t.role, t.company].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
