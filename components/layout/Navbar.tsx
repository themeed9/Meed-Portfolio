"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import BrandMark from "./BrandMark";

const links = [
  ["Work", "/work"], ["About", "/about"], ["Resume", "/resume"], ["Contact", "/contact"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [open]);

  const active = (href: string) => pathname === href || (href === "/work" && pathname.startsWith("/work/"));
  const mastheadChrome = pathname === "/" && !open;

  return <header className={mastheadChrome ? "home-navbar absolute inset-x-0 top-5 z-40" : "fixed inset-x-0 top-0 z-40 border-b border-border-subtle bg-bg-primary/95 backdrop-blur-md"}>
    <nav className={mastheadChrome ? "hero-nav-shell flex h-[72px] items-center justify-between" : "shell flex h-16 items-center justify-between"} aria-label="Primary navigation">
      <Link href="/" className="inline-flex min-h-11 items-center gap-3" aria-label="Meed, home">
        <BrandMark context={mastheadChrome ? "hero" : "surface"} />
      </Link>
      <div className={mastheadChrome ? "home-nav-links hidden items-center md:flex" : "hidden items-center gap-1 md:flex"}>
        {links.map(([label, href]) => <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className={mastheadChrome ? "home-nav-link inline-flex min-h-11 items-center" : `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium ${active(href) ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:text-text-primary"}`}>{label}</Link>)}
      </div>
      <button type="button" className={mastheadChrome ? "home-menu-button inline-flex min-h-11 items-center justify-end md:hidden" : "inline-flex size-11 items-center justify-center rounded-full md:hidden"} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>{mastheadChrome ? (open ? "Close" : "Menu") : (open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />)}</button>
    </nav>
    {open && <div id="mobile-navigation" className="border-t border-border-subtle bg-bg-primary md:hidden">
      <div className="shell flex min-h-[calc(100dvh-4rem)] flex-col py-6">
        {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined} className="flex min-h-14 items-center border-b border-border-subtle text-xl font-semibold">{label}</Link>)}
      </div>
    </div>}
  </header>;
}
