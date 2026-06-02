import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";
import AdminHeader from "@/components/layout/AdminHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

async function togglePublish(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  const project = await prisma.project.findUnique({ where: { id }, select: { published: true } });
  if (project) {
    await prisma.project.update({ where: { id }, data: { published: !project.published } });
  }
}

async function deleteProject(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  await prisma.project.delete({ where: { id } });
}

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
    include: { images: { take: 1, orderBy: { order: "asc" } } },
  }).catch(() => []);

  return (
    <div>
      <AdminHeader
        title="Projects"
        description="Manage your portfolio projects"
        action={
          <Link href="/admin/projects/new">
            <Button variant="primary" size="sm">
              <Plus size={16} />
              New Project
            </Button>
          </Link>
        }
      />

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">No projects yet</p>
          <Link href="/admin/projects/new">
            <Button variant="primary">Create Your First Project</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Project</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Featured</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {project.coverImage ? (
                          <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{project.title}</p>
                        <p className="text-xs text-gray-500">{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{project.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={project.published ? "success" : "default"}>
                      {project.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {project.featured ? (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md">Featured</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <form action={togglePublish.bind(null, project.id)}>
                        <button
                          type="submit"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          title={project.published ? "Unpublish" : "Publish"}
                        >
                          {project.published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </form>
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <form action={deleteProject.bind(null, project.id)}>
                        <button
                          type="submit"
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/40"
                          title="Delete"
                          onClick={(e) => { if (!confirm("Delete this project?")) e.preventDefault(); }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
