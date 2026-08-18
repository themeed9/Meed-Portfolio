"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  ["Work", "/work"], ["About", "/about"], ["Resume", "/resume"], ["Contact", "/contact"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState("MEED");
  const pathname = usePathname();

  useEffect(() => { fetch("/api/settings").then(response => response.json()).then(settings => { if (typeof settings.siteName === "string") setSiteName(settings.siteName); }).catch(() => {}); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [open]);

  const active = (href: string) => pathname === href || (href === "/work" && pathname.startsWith("/work/"));
  const mastheadChrome = pathname === "/" && !open;

  return <header className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md ${mastheadChrome ? "border-white/15 bg-[#07100b]/95 text-white" : "border-border-subtle bg-bg-primary/95"}`}>
    <nav className="shell flex h-16 items-center justify-between" aria-label="Primary navigation">
      <Link href="/" className="inline-flex min-h-11 items-center gap-3" aria-label="Meed, home">
        <span className="text-sm font-bold tracking-[0.18em]">{siteName}</span>
      </Link>
      <div className="hidden items-center gap-1 md:flex">
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ${mastheadChrome ? "text-white/80 hover:bg-white/10 hover:text-white" : active(href) ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>{label}</Link>)}
      </div>
      <button type="button" className="inline-flex size-11 items-center justify-center rounded-full md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
    </nav>
    {open && <div id="mobile-navigation" className="border-t border-border-subtle bg-bg-primary md:hidden">
      <div className="shell flex min-h-[calc(100dvh-4rem)] flex-col py-6">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined} className="flex min-h-14 items-center border-b border-border-subtle text-xl font-semibold">{label}</Link>)}
      </div>
    </div>}
  </header>;
}
