"use client";

import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TextRevealProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
}

export default function TextReveal({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.03,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll(".reveal-word");

    gsap.fromTo(
      words,
      { y: "100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          once: true,
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [delay, stagger]);

  const splitText = (text: string) => {
    return text.split(" ").map((word, i) => (
      <span key={i} className="inline-block overflow-hidden">
        <span className="reveal-word inline-block translate-y-full">
          {word}
        </span>
        {i < text.split(" ").length - 1 && "\u00A0"}
      </span>
    ));
  };

  const extractText = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node && typeof node === "object" && "props" in node) {
      return extractText((node as any).props.children);
    }
    return "";
  };

  const text = extractText(children);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <Tag>{splitText(text)}</Tag>
    </div>
  );
}
