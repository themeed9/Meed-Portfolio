"use client";

import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      }}
    >
      {children}
    </ReactLenis>
  );
}
