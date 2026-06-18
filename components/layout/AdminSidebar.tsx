"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, FileText, Wrench, MessageSquare, LogOut, Image, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Skills", href: "/admin/skills", icon: Wrench },
  { label: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { label: "Resume", href: "/admin/resume", icon: FileText },
  { label: "Media Library", href: "/admin/media", icon: Image },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-surface-primary border-r border-border-subtle flex flex-col">
      <div className="p-6 border-b border-border-subtle">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-text-primary">
          MEED CMS
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(link.href)
                ? "bg-primary-subtle text-text-accent"
                : "text-text-tertiary hover:bg-surface-tertiary"
            }`}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border-subtle space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-tertiary hover:bg-surface-tertiary transition-colors"
          target="_blank"
        >
          <LayoutDashboard size={18} />
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-base hover:bg-surface-tertiary transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
