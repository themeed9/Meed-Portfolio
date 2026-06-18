"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete,
    });

    // Animate progress counter
    const obj = { val: 0 };
    tl.to(obj, {
      val: 100,
      duration: 2.5,
      ease: "power2.inOut",
      onUpdate: () => {
        setProgress(Math.round(obj.val));
      },
    });

    // Animate progress bar
    tl.to(
      barRef.current,
      { scaleX: 1, duration: 2.5, ease: "power2.inOut" },
      0
    );

    // Hold for a moment, then slide up
    tl.to(containerRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "power3.inOut",
      delay: 0.2,
    });

    // Hard cap: force complete at 3s
    const forceComplete = setTimeout(() => {
      tl.progress(1);
    }, 3000);

    return () => {
      clearTimeout(forceComplete);
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div ref={numRef} className="text-[var(--font-size-display-lg)] font-bold text-white tabular-nums">
        {progress}
      </div>

      <div className="absolute bottom-[var(--spacing-8)] left-[var(--spacing-6)] right-[var(--spacing-6)] h-px bg-white/10" aria-hidden="true">
        <div
          ref={barRef}
          className="h-full bg-white origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
