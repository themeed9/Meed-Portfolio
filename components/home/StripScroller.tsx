"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Project strip that drifts slowly on its own (owner request) in a seamless loop.
// - A second copy of the tiles follows the first so the loop never shows a gap; it is
//   hidden from assistive tech and inert, so screen readers and keyboards meet each tile once.
// - Pausing (owner removed the visible Pause button, 2026-11-25): it stops while hovered, touched
//   or focused (keyboard users tab into it), and for 4s after an arrow press.
// - prefers-reduced-motion: never moves on its own; the arrows, swipe and keyboard still scroll it.
// - The scrollbar is hidden; arrows, trackpad, swipe and the keyboard still scroll it.

const SPEED_PX_PER_SECOND = 24;
const RESUME_AFTER_MS = 4000;

export default function StripScroller({ label, children }: { label: string; children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null);
  const firstCopy = useRef<HTMLUListElement>(null);
  const position = useRef(0);
  const hold = useRef(false); // hover, focus or touch
  const resumeAt = useRef(0);
  const playingRef = useRef(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) playingRef.current = false;
  }, []);

  const loopWidth = useCallback(() => {
    const list = firstCopy.current;
    if (!list) return 0;
    const gap = parseFloat(getComputedStyle(list.parentElement as HTMLElement).columnGap || "0") || 0;
    return list.offsetWidth + gap;
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    let last = performance.now();
    let driving = false;

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const width = loopWidth();
      if (playingRef.current && !hold.current && now >= resumeAt.current && width > el.clientWidth) {
        position.current += (SPEED_PX_PER_SECOND * dt) / 1000;
        if (position.current >= width) position.current -= width;
        driving = true;
        el.scrollLeft = position.current;
      }
      frame = requestAnimationFrame(tick);
    };

    // Keep our position in step when the visitor scrolls by hand, and wrap at either end.
    const onScroll = () => {
      if (driving) { driving = false; return; }
      const width = loopWidth();
      let left = el.scrollLeft;
      if (width > 0 && left >= width) { left -= width; el.scrollLeft = left; }
      position.current = left;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); el.removeEventListener("scroll", onScroll); };
  }, [loopWidth]);

  const step = (direction: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const width = loopWidth();
    let target = el.scrollLeft + direction * Math.max(280, el.clientWidth * 0.6);
    if (target < 0 && width > 0) { el.scrollLeft += width; target += width; }
    resumeAt.current = performance.now() + RESUME_AFTER_MS;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  };

  const pauseHold = () => { hold.current = true; };
  const releaseHold = () => { hold.current = false; resumeAt.current = performance.now() + 600; };

  return (
    <div className="home-strip-scroller">
      <div className="home-shell home-strip-controls">
        <button type="button" className="home-strip-arrow" onClick={() => step(-1)} aria-label="Scroll projects left">
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button type="button" className="home-strip-arrow" onClick={() => step(1)} aria-label="Scroll projects right">
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div
        ref={scroller}
        className="home-strip-viewport"
        tabIndex={0}
        role="region"
        aria-label={`${label}. Scrolling stops while you hover, touch or focus it.`}
        onMouseEnter={pauseHold}
        onMouseLeave={releaseHold}
        onFocus={pauseHold}
        onBlur={releaseHold}
        onTouchStart={pauseHold}
        onTouchEnd={releaseHold}
      >
        <div className="home-strip-track">
          <ul ref={firstCopy} className="home-strip-list">{children}</ul>
          {/* Loop copy: decorative only, never announced or focusable. */}
          <ul className="home-strip-list" aria-hidden="true" inert>{children}</ul>
        </div>
      </div>
    </div>
  );
}
