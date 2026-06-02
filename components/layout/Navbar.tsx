"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleDark = () => {
    setTheme(isDark ? "light" : "dark");
  };

  useEffect(() => { setIsOpen(false); }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-outline-variant"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] h-16 flex items-center justify-between">
        <Link
          href="/"
          className={`text-xl font-bold tracking-tight transition-colors ${
            isScrolled ? "text-on-surface" : isDark ? "text-white" : "text-on-surface"
          }`}
        >
          MEED
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-[var(--radius-sm)] hover:bg-surface-container-high transition-colors ${
            isScrolled ? "text-on-surface-variant" : isDark ? "text-white/70" : "text-on-surface-variant"
          }`}
          aria-label="Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {isOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface">
          <div className="px-[var(--spacing-6)] py-[var(--spacing-4)] space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
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
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
