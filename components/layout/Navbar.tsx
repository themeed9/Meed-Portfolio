"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

// Figma "Header": wordmark, Work · Beyond · About · Contact, theme toggle (ADR-010 phase 5).
const links = [
  ["Work", "/work"], ["Beyond", "/#beyond"], ["About", "/about"], ["Contact", "/contact"],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Homepage only: the header is transparent over the sky until the page scrolls, then fills.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);
  const overSky = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", close); };
  }, [open]);

  const active = (href: string) => href !== "/#beyond" && (pathname === href || (href === "/work" && pathname.startsWith("/work/")));

  return (
    <header className="site-header" data-over-sky={overSky ? "" : undefined}>
      <nav className="site-header-inner" aria-label="Primary navigation">
        <Link href="/" className="site-wordmark" aria-label="Meed, home">MEED</Link>
        <div className="site-nav-links">
          {links.map(([label, href]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} className="site-nav-link">{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="site-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="mobile-navigation" className="site-mobile-nav">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active(href) ? "page" : undefined} className="site-mobile-link">{label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
