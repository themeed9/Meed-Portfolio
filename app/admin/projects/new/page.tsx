"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import AdminHeader from "@/components/layout/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  const router = useRouter();
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: { featured: false, published: false },
  });

  const onSubmit = async (data: ProjectFormData) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
    }
  };

  return (
    <div>
      <AdminHeader title="New Project" description="Create a new portfolio project" backHref="/admin/projects" />
      <div className="max-w-3xl">
        <ProjectForm form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} />
      </div>
    </div>
  );
}
