"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import AdminHeader from "@/components/layout/AdminHeader";

interface ProjectImage {
  url: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  featured: boolean;
  coverImage: string | null;
  images: ProjectImage[];
}

interface Props {
  projects: Project[];
}

export default function ProjectTable({ projects }: Props) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleToggle = async (id: string) => {
    await fetch(`/api/projects/${id}/toggle`, { method: "POST" });
    router.refresh();
  };

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
        <div className="text-center py-20 text-text-tertiary">
          <p className="mb-4">No projects yet</p>
          <Link href="/admin/projects/new">
            <Button variant="primary">Create Your First Project</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-primary rounded-2xl border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider px-6 py-4">Project</th>
                <th className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider px-6 py-4">Category</th>
                <th className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-text-tertiary uppercase tracking-wider px-6 py-4">Featured</th>
                <th className="text-right text-xs font-semibold text-text-tertiary uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-border-subtle hover:bg-bg-secondary transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center shrink-0 overflow-hidden relative">
                        {project.coverImage ? (
                          <Image src={project.coverImage} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="text-xs text-text-tertiary">IMG</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{project.title}</p>
                        <p className="text-xs text-text-tertiary">{project.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">{project.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={project.published ? "success" : "default"}>
                      {project.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {project.featured ? (
                      <span className="text-xs font-medium text-secondary-base bg-secondary-subtle px-2.5 py-1 rounded-md">Featured</span>
                    ) : (
                      <span className="text-xs text-text-tertiary">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(project.id)}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-text-secondary transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        title={project.published ? "Unpublish" : "Publish"}
                      >
                        {project.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-text-accent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-primary-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
