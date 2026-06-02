import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
