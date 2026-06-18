import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Login page has its own auth flow — don't redirect here
  if (session?.user) {
    return (
      <div className="flex min-h-screen bg-bg-secondary">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
