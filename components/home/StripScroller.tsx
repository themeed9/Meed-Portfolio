"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Horizontal scroller for the project strip: previous/next buttons (disabled at the ends) plus
// a keyboard-focusable scroll region, so it works by mouse, touch, trackpad and keyboard.
export default function StripScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);

  const scroll = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.8), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="home-strip-scroller">
      <div className="home-shell home-strip-controls">
        <button type="button" className="home-strip-arrow" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Scroll projects left">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" className="home-strip-arrow" onClick={() => scroll(1)} disabled={edges.end} aria-label="Scroll projects right">
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <ul ref={ref} className="home-strip-list" tabIndex={0} aria-label={label}>
        {children}
      </ul>
    </div>
  );
}
