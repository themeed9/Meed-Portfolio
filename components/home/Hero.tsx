"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  heroImage?: string;
  heroImageAlt?: string;
  profileImage?: string | null;
}

export default function Hero({ content }: { content: HeroContent }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      gsap.set(badgeRef.current, { opacity: 1, y: 0 });
      gsap.set(subtitleRef.current, { opacity: 1, y: 0 });
      gsap.set(ctaRef.current, { opacity: 1, y: 0 });
      const titleWords = titleRef.current?.querySelectorAll(".hero-word");
      if (titleWords?.length) {
        gsap.set(titleWords, { y: "0%", opacity: 1 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      // Badge slides in
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      // Title words reveal
      const titleWords = titleRef.current?.querySelectorAll(".hero-word");
      if (titleWords?.length) {
        tl.fromTo(
          titleWords,
          { y: "100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.04 },
          "-=0.3"
        );
      }

      // Subtitle fades in
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );

      // CTAs slide up
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );

      // Sliding picture mask — clip-path reveals photo left-to-right
      if (maskRef.current && content.profileImage) {
        tl.fromTo(
          maskRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "power3.inOut" },
          "-=0.6"
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, [content.profileImage]);

  const splitTitle = (text: string) => {
    return text.split("\n").map((line, lineIdx) => (
      <span key={lineIdx} className="block">
        {line.split(" ").map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block overflow-hidden">
            <span className="hero-word inline-block pt-[0.15em] pb-[0.05em]">
              {word}
            </span>
            {wordIdx < line.split(" ").length - 1 && "\u00A0"}
          </span>
        ))}
      </span>
    ));
  };

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[600px] flex items-end overflow-hidden"
    >


      {/* Content */}
      <div className="relative z-10 w-full max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] pb-[var(--spacing-11)] md:pb-[var(--spacing-12)]">
        <div className="max-w-3xl">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-[var(--spacing-4)] py-1.5 rounded-full bg-surface-container-high border border-outline-variant mb-[var(--spacing-6)] opacity-0"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-xs font-medium text-on-surface-variant">
              AI-First Product Designer
            </span>
          </div>

          <h1
            ref={titleRef}
            className="text-5xl md:text-7xl lg:text-[var(--font-size-display-lg)] font-bold tracking-tight text-on-surface leading-[var(--line-height-display)]"
          >
            {splitTitle(content.title)}
          </h1>

          <p
            ref={subtitleRef}
            className="mt-[var(--spacing-6)] text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed opacity-0"
          >
            {content.subtitle}
          </p>

          <div
            ref={ctaRef}
            className="flex flex-wrap gap-4 mt-[var(--spacing-10)] opacity-0"
          >
            <Link
              href={content.ctaLink}
              className="inline-flex items-center gap-2 px-[var(--spacing-8)] py-3.5 bg-inverse-surface text-inverse-on-surface rounded-[var(--radius-md)] text-sm font-medium hover:opacity-90 transition-all cursor-pointer"
            >
              {content.ctaText}
              <ArrowRight size={16} />
            </Link>
            <Link
              href={content.secondaryCtaLink}
              className="inline-flex items-center gap-2 px-[var(--spacing-8)] py-3.5 border-2 border-outline text-on-surface rounded-[var(--radius-md)] text-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              {content.secondaryCtaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Sliding picture mask — portrait photo on the right */}
      {content.profileImage && (
        <div ref={maskRef} className="absolute right-0 bottom-0 w-[280px] md:w-[400px] lg:w-[500px] h-[70%] md:h-[80%] z-[5]" style={{ clipPath: "inset(0 100% 0 0)" }}>
          <Image
            src={content.profileImage}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 280px, 500px"
            priority
          />
          {/* Gradient fade on the left edge to blend with content */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
        </div>
      )}
    </section>
  );
}
