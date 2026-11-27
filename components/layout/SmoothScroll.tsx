"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Site-wide motion engine (owner request, 2026-11-27, inspired by the interaction patterns of
// robin-noguier.com; our own design, no WebGL):
// - Momentum scrolling with Lenis. It drives the real window scroll, so anchors, sticky headers,
//   find-in-page, keyboard and screen readers keep working.
// - --scroll-skew on <html>: eased scroll velocity in [-1, 1]. CSS tilts media with it, so images
//   bend slightly while scrolling fast and settle when scrolling stops.
// - --parallax on each [data-parallax] element in view: its position in the viewport in [-1, 1],
//   used to drift its image slightly slower than the page.
// - --scroll-progress on <html>, shown as a thin line on the right edge.
// With prefers-reduced-motion, none of the smoothing, tilt or drift runs; only the progress line
// updates, from the native scroll.

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce ? null : new Lenis({ lerp: 0.09, anchors: true, stopInertiaOnNavigate: true });

    const visible = new Set<HTMLElement>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(el);
        else { visible.delete(el); el.style.setProperty("--parallax", "0"); }
      }
    }, { rootMargin: "15% 0px" });
    if (!reduce) document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => observer.observe(el));

    let skew = 0;
    let lastSkew = "";
    let lastProgress = "";
    let frame = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      const max = root.scrollHeight - window.innerHeight;
      const progress = (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4);
      if (progress !== lastProgress) { root.style.setProperty("--scroll-progress", progress); lastProgress = progress; }
      if (lenis) {
        skew += (clamp(lenis.velocity / 45) - skew) * 0.14;
        const value = Math.abs(skew) < 0.002 ? "0" : skew.toFixed(3);
        if (value !== lastSkew) { root.style.setProperty("--scroll-skew", value); lastSkew = value; }
        const half = window.innerHeight / 2;
        for (const el of visible) {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--parallax", clamp((rect.top + rect.height / 2 - half) / (half + rect.height / 2)).toFixed(3));
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      lenis?.destroy();
      root.style.removeProperty("--scroll-skew");
    };
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden="true"><span /></div>;
}
