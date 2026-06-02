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
    { label: "Projects", value: projectCount, icon: FolderKanban, href: "/admin/projects", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { label: "Messages", value: messageCount, icon: MessageSquare, href: "/admin/content", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Testimonials", value: testimonialCount, icon: Eye, href: "/admin/testimonials", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
    { label: "Skills", value: skillCount, icon: Wrench, href: "/admin/skills", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {session.user.name || "Admin"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block group cursor-pointer">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
            <Link href="/admin/content" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-gray-300" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{msg.name}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.subject || msg.message.substring(0, 60)}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/admin/projects/new" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <FolderKanban size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">New Project</span>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/admin/content" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-emerald-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Messages {unreadMessages > 0 && <span className="text-emerald-600">({unreadMessages} unread)</span>}
                </span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
            <Link href="/admin/skills" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Wrench size={18} className="text-amber-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Skills</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
            <Link href="/" target="_blank" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Eye size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">View Site</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
