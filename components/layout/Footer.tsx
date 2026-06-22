import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { FaLinkedinIn, FaXTwitter, FaDribbble, FaGithub } from "react-icons/fa6";

const socialIcons: Record<string, React.ReactNode> = {
  linkedin: <FaLinkedinIn size={16} />,
  twitter: <FaXTwitter size={16} />,
  dribbble: <FaDribbble size={16} />,
  github: <FaGithub size={16} />,
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
  let footerBgUrl: string | null = null;
  let logoUrl: string | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const [links, settings] = await Promise.all([
      prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
      prisma.siteContent.findUnique({ where: { key: "site-settings" } }),
    ]);
    socialLinks = links;
    const value = settings?.value as Record<string, unknown> | undefined;
    footerBgUrl = (value?.footerBgImage as string) || null;
    logoUrl = (value?.logoUrl as string) || null;
  } catch {
    const { fallbackSocialLinks } = await import("@/lib/defaults");
    socialLinks = fallbackSocialLinks;
  }

  if (!logoUrl) {
    logoUrl = "https://res.cloudinary.com/dlfax4vpr/image/upload/q_auto/v1782126019/Subtract_mlmndl.png";
  }

  return (
    <footer className="relative border-t border-outline-variant">
      {footerBgUrl && (
        <div className="absolute inset-0 z-0">
          <Image src={footerBgUrl} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-surface-container-low/90" aria-hidden="true" />
        </div>
      )}
      <div className="relative z-10 max-w-[var(--content-width-wide)] mx-auto px-[var(--spacing-6)] py-[var(--spacing-14)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-12)]">
          <div>
            <Link href="/" className="inline-block">
              {logoUrl ? (
                <div className="relative h-6 w-auto min-w-[98px]">
                  <Image src={logoUrl} alt="MEED" fill className="object-contain object-left" style={{ filter: "var(--logo-filter)" }} />
                </div>
              ) : (
                <span className="text-xl font-bold tracking-tight text-on-surface">MEED</span>
              )}
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
                  aria-label={`Visit ${link.platform} profile`}
                >
                  <span aria-hidden="true">{socialIcons[link.icon?.toLowerCase() || ""] || link.platform}</span>
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
              <Mail size={16} aria-hidden="true" />
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
