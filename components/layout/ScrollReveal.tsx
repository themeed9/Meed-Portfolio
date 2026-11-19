"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Scroll reveal for every public page (owner request; ADR-009 motion limits).
// - Each <section> in <main> (and anything marked [data-reveal], e.g. a Selected work card) fades
//   and rises into place the first time it scrolls into view.
// - Inside a revealed block, the children of [data-reveal-group] follow in a short stagger.
// - Only blocks that start below the fold are ever hidden, so first paint never waits on motion.
// - Nothing is hidden without JavaScript, without IntersectionObserver, or with
//   prefers-reduced-motion, so content is always readable.
// A container that should not reveal as a whole (because its children reveal one by one)
// carries [data-reveal-skip].

const TARGETS = "main section:not([data-reveal-skip]), main [data-reveal]";
const GROUP_START_MS = 140;
const GROUP_STEP_MS = 70;

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const fold = window.innerHeight;
    const below = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter((el) => el.getBoundingClientRect().top > fold);
    // Outermost blocks only: a section inside a revealing section rides along with its parent.
    const targets = below.filter((el) => !below.some((other) => other !== el && other.contains(el)));
    const touched: HTMLElement[] = [];

    for (const target of targets) {
      target.classList.add("reveal-block", "reveal-pending");
      touched.push(target);
      target.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        Array.from(group.children).forEach((child, index) => {
          const el = child as HTMLElement;
          el.style.setProperty("--reveal-delay", `${GROUP_START_MS + index * GROUP_STEP_MS}ms`);
          el.classList.add("reveal-item", "reveal-pending");
          touched.push(el);
        });
      });
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.remove("reveal-pending");
        el.querySelectorAll(".reveal-pending").forEach((child) => child.classList.remove("reveal-pending"));
        observer.unobserve(el);
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      // Never leave content hidden if this page unmounts or the effect re-runs.
      touched.forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, [pathname]);

  return null;
}
