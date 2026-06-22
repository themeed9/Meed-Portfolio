"use client";

import { useState, useCallback } from "react";
import { ThemeProvider } from "@/lib/theme-context";
import SmoothScroll from "@/components/effects/SmoothScroll";
import LoadingScreen from "@/components/loading/LoadingScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return true;
  });

  const handleLoadComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  return (
    <ThemeProvider>
      <SmoothScroll>
        {showLoading && <LoadingScreen onComplete={handleLoadComplete} />}
        <div style={{ opacity: showLoading ? 0 : 1, transition: "opacity 0.3s ease" }}>
          {children}
        </div>
      </SmoothScroll>
    </ThemeProvider>
  );
}
