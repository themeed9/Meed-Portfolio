"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { Menu, X, Moon, Sun } from "lucide-react";

const navLinks = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const logoUrl = "https://res.cloudinary.com/dlfax4vpr/image/upload/q_auto/f_auto/v1782126019/Subtract_mlmndl.png";
  const [siteName, setSiteName] = useState("MEED");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || "MEED");
      })
      .catch(() => {});
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleDark = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // Close mobile menu on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-outline-variant"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav
        className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className={`flex items-center gap-2 transition-colors ${
            isScrolled ? "text-on-surface" : isDark ? "text-white" : "text-on-surface"
          }`}
          aria-label="Home"
        >
          <div className="relative h-7 w-auto min-w-[112px]">
            <Image
              src={logoUrl}
              alt={siteName}
              fill
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? isScrolled
                    ? isDark ? "text-primary" : "text-primary-safe"
                    : isDark ? "text-white" : "text-primary-safe"
                  : isScrolled ? "text-on-surface-variant hover:text-on-surface" : isDark ? "text-white/70 hover:text-white" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleDark}
            className={`p-2 rounded-[var(--radius-sm)] hover:bg-surface-container-high transition-colors ${
              isScrolled ? "text-on-surface-variant" : isDark ? "text-white/70 hover:text-white" : "text-on-surface-variant"
            }`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-[var(--radius-sm)] hover:bg-surface-container-high transition-colors ${
            isScrolled ? "text-on-surface-variant" : isDark ? "text-white/70" : "text-on-surface-variant"
          }`}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
        >
          {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-outline-variant bg-surface"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="px-[var(--spacing-6)] py-[var(--spacing-4)] space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? isDark ? "text-primary" : "text-primary-safe"
                    : "text-on-surface-variant"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 py-2 text-sm font-medium text-on-surface-variant"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
