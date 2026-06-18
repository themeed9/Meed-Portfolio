"use client";

import Link from "next/link";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductSlideShow from "./ProductSlideShow";

interface Slide {
  src: string;
  alt: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  slides?: Slide[];
}

export default function Hero({ content }: { content: HeroContent }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );

      const titleWords = titleRef.current?.querySelectorAll(".hero-word");
      if (titleWords?.length) {
        tl.fromTo(
          titleWords,
          { y: "100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.04 },
          "-=0.3"
        );
      }

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.3"
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const splitTitle = (text: string) => {
    return text.split("\n").map((line, lineIdx) => (
      <span key={lineIdx} className="block">
        {line.split(" ").map((word, wordIdx) => (
          <React.Fragment key={wordIdx}>
            <span className="inline-block overflow-hidden">
              <span className="hero-word inline-block pt-[0.15em] pb-[0.05em]">
                {word}
              </span>
            </span>
            {wordIdx < line.split(" ").length - 1 && "\u00A0"}
          </React.Fragment>
        ))}
      </span>
    ));
  };

  const slides = content.slides?.length ? content.slides : [];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >

      <div className="relative z-10 w-full max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] py-[var(--spacing-11)] md:py-[var(--spacing-12)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">

          {/* Left column — text copy & CTAs */}
          <div className="max-w-2xl">
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
              className="text-4xl md:text-5xl lg:text-[40px] font-semibold tracking-tight text-on-surface leading-[var(--line-height-display)]"
            >
              {splitTitle(content.title)}
            </h1>

            <p
              ref={subtitleRef}
              className="mt-[var(--spacing-6)] text-[15px] text-on-surface-variant max-w-[400px] leading-relaxed opacity-0"
            >
              {content.subtitle.split("\n").map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < content.subtitle.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>

            <div
              ref={ctaRef}
              className="flex flex-wrap gap-4 mt-[var(--spacing-10)] opacity-0"
            >
              <Link
                href={content.ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 bg-bg-inverse text-text-inverse rounded-full text-sm font-medium hover:opacity-90 transition-all cursor-pointer"
              >
                {content.ctaText}
                <ArrowRight size={16} />
              </Link>
              <Link
                href={content.secondaryCtaLink}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-border-default text-text-primary rounded-full text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
              >
                {content.secondaryCtaText}
              </Link>
            </div>
          </div>

          {/* Right column — product slideshow */}
          <div className="relative w-full aspect-[4/3] lg:aspect-[4/5] max-h-[70vh]">
            <ProductSlideShow slides={slides} />
          </div>

        </div>
      </div>
    </section>
  );
}
