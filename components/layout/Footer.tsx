import Link from "next/link";
import { Mail, Link as LinkIcon, AtSign, Globe, GitBranch } from "lucide-react";

const socialIcons: Record<string, React.ReactNode> = {
  linkedin: <LinkIcon size={18} />,
  twitter: <AtSign size={18} />,
  dribbble: <Globe size={18} />,
  github: <GitBranch size={18} />,
};

const footerLinks = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
];

export default async function Footer() {
  let socialLinks: any[] = [];
  try {
    const { prisma } = await import("@/lib/prisma");
    socialLinks = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
  } catch {
    const { fallbackSocialLinks } = await import("@/lib/defaults");
    socialLinks = fallbackSocialLinks;
  }

  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] py-[var(--spacing-14)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-12)]">
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-on-surface">
              MEED
            </Link>
            <p className="mt-4 text-sm text-on-surface-variant max-w-xs">
              Product Designer crafting clear, usable, developer-friendly digital products with an AI edge.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-[var(--radius-sm)] bg-surface-container-high text-on-surface-variant hover:text-primary-safe hover:bg-surface-container-highest transition-all"
                  aria-label={link.platform}
                >
                  {socialIcons[link.icon?.toLowerCase() || ""] || <span>{link.platform}</span>}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Navigation</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Get in Touch</h3>
            <p className="mt-4 text-sm text-on-surface-variant">
              Have a project in mind? Let&apos;s talk about how I can help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-primary-safe hover:text-primary-container transition-colors"
            >
              <Mail size={16} />
              Start a Conversation
            </Link>
          </div>
        </div>

        <div className="mt-[var(--spacing-12)] pt-8 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} Abdulhameed Abdulsalam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
