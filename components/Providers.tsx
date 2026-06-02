"use client";

import { useState, useCallback } from "react";
import { ThemeProvider } from "next-themes";
import SmoothScroll from "@/components/effects/SmoothScroll";
import LoadingScreen from "@/components/loading/LoadingScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SmoothScroll>
        {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}
        <div style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s ease" }}>
          {children}
        </div>
      </SmoothScroll>
    </ThemeProvider>
  );
}
