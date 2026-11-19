"use client";

import { useEffect } from "react";

// Text motion for Selected work (owner request; ADR-009 limits). As a card scrolls into view,
// the children of its [data-reveal-group] (label, title, summary, facts, button) fade up in a
// short stagger. Text already on screen at load is never hidden or animated, and nothing
// happens without JavaScript or with prefers-reduced-motion, so content is always readable.

const STEP_MS = 70;

export default function CardTextReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-group]"))
      .filter((group) => group.getBoundingClientRect().top > window.innerHeight);

    for (const group of groups) {
      Array.from(group.children).forEach((child, index) => {
        const el = child as HTMLElement;
        el.style.setProperty("--reveal-delay", `${index * STEP_MS}ms`);
        el.classList.add("reveal-item", "reveal-pending");
      });
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.querySelectorAll(".reveal-pending").forEach((el) => el.classList.remove("reveal-pending"));
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.1 });

    groups.forEach((group) => observer.observe(group));
    return () => observer.disconnect();
  }, []);

  return null;
}
