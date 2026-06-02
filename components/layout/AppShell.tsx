"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function AppShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      {footer}
    </>
  );
}
