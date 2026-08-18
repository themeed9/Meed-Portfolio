"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import AdminHeader from "@/components/layout/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const form = useForm<ProjectFormData>({
    resolver: formResolver(projectSchema),
    defaultValues: { featured: false, published: false, order: 0 },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setError("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to create project");
    }
  };

  return (
    <div>
      <AdminHeader title="New Project" description="Create a new portfolio project" backHref="/admin/projects" />
      <div className="max-w-3xl">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        <ProjectForm form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} />
      </div>
    </div>
  );
}
