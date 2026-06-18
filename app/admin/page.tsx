import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban, MessageSquare, FileText, Wrench, ArrowRight, Eye } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [projectCount, messageCount, testimonialCount, skillCount] = await Promise.all([
    prisma.project.count().catch(() => 0),
    prisma.contactMessage.count().catch(() => 0),
    prisma.testimonial.count().catch(() => 0),
    prisma.skill.count().catch(() => 0),
  ]);

  const unreadMessages = await prisma.contactMessage.count({ where: { read: false } }).catch(() => 0);
  const recentMessages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []);

  const stats = [
    { label: "Projects", value: projectCount, icon: FolderKanban, href: "/admin/projects", color: "text-text-accent bg-primary-subtle" },
    { label: "Messages", value: messageCount, icon: MessageSquare, href: "/admin/content", color: "text-primary-base bg-primary-subtle" },
    { label: "Testimonials", value: testimonialCount, icon: Eye, href: "/admin/testimonials", color: "text-secondary-base bg-secondary-subtle" },
    { label: "Skills", value: skillCount, icon: Wrench, href: "/admin/skills", color: "text-tertiary-base bg-tertiary-subtle" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-tertiary">Welcome back, {session.user.name || "Admin"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block group cursor-pointer">
            <div className="p-6 rounded-2xl bg-surface-primary border border-border-subtle hover:border-border-default hover:shadow-md transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-sm text-text-tertiary mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-primary border border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-text-primary">Recent Messages</h2>
            <Link href="/admin/content" className="text-sm text-text-accent hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-text-tertiary py-8 text-center">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 p-3 rounded-lg bg-bg-secondary">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-border-strong" : "bg-primary-base"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{msg.name}</p>
                    <p className="text-xs text-text-tertiary truncate">{msg.subject || msg.message.substring(0, 60)}</p>
                  </div>
                  <span className="text-xs text-text-tertiary shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-surface-primary border border-border-subtle">
          <h2 className="font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/projects/new" className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-surface-tertiary transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <FolderKanban size={18} className="text-primary-base" />
                <span className="text-sm font-medium text-text-primary">New Project</span>
              </div>
              <ArrowRight size={16} className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/admin/content" className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-surface-tertiary transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-primary-base" />
                <span className="text-sm font-medium text-text-primary">
                  Messages {unreadMessages > 0 && <span className="text-primary-base">({unreadMessages} unread)</span>}
                </span>
              </div>
              <ArrowRight size={16} className="text-text-tertiary" />
            </Link>
            <Link href="/admin/skills" className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-surface-tertiary transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Wrench size={18} className="text-tertiary-base" />
                <span className="text-sm font-medium text-text-primary">Manage Skills</span>
              </div>
              <ArrowRight size={16} className="text-text-tertiary" />
            </Link>
            <Link href="/" target="_blank" className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary hover:bg-surface-tertiary transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-secondary-base" />
                <span className="text-sm font-medium text-text-primary">View Site</span>
              </div>
              <ArrowRight size={16} className="text-text-tertiary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
