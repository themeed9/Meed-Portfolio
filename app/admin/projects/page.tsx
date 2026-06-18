import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectTable from "@/components/admin/ProjectTable";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  }).catch(() => []);

  return <ProjectTable projects={projects} />;
}
