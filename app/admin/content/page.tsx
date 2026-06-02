import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import ContentForm from "@/components/admin/ContentForm";

export const dynamic = "force-dynamic";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Mail } from "lucide-react";

async function markAsRead(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
}

export default async function AdminContentPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [contentEntries, messages] = await Promise.all([
    prisma.siteContent.findMany({ orderBy: { key: "asc" } }).catch(() => []),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);

  const unreadCount = messages.filter((m: any) => !m.read).length;

  return (
    <div>
      <AdminHeader
        title="Content Manager"
        description={`Manage homepage content${unreadCount > 0 ? ` — ${unreadCount} unread messages` : ""}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {contentEntries.map((entry) => (
          <ContentForm key={entry.id} entry={entry} />
        ))}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-12 mt-12">
        <div className="flex items-center gap-3 mb-6">
          <Mail size={20} className="text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
          {unreadCount > 0 && (
            <span className="text-xs font-medium text-white bg-blue-600 px-2 py-0.5 rounded-full">{unreadCount} new</span>
          )}
        </div>

        {messages.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No messages received yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <form key={msg.id} action={markAsRead.bind(null, msg.id)} className={`p-5 rounded-2xl border transition-colors ${
                msg.read
                  ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                  : "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">{msg.name}</p>
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    {!msg.read && (
                      <button type="submit" className="text-xs text-blue-600 hover:underline">Mark read</button>
                    )}
                  </div>
                </div>
                {msg.subject && (
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{msg.subject}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{msg.message}</p>
              </form>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
