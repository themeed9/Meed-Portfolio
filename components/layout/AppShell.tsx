"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import ScrollReveal from "./ScrollReveal";
import SmoothScroll from "./SmoothScroll";

export default function AppShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen outline-none">{children}</main>
      <ScrollReveal />
      <SmoothScroll />
      {footer}
    </>
  );
}
