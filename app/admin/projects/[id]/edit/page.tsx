"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import AdminHeader from "@/components/layout/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema) as any,
  });

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        Object.entries(data).forEach(([key, value]) => {
          if (key === "tags" || key === "tools") {
            form.setValue(key as keyof ProjectFormData, Array.isArray(value) ? value.join(", ") : "");
          } else {
            form.setValue(key as keyof ProjectFormData, value as any);
          }
        });
        setIsLoading(false);
      });
  }, [params.id, form]);

  const onSubmit = async (data: ProjectFormData) => {
    const res = await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div>
        <AdminHeader title="Edit Project" backHref="/admin/projects" />
        <div className="text-center py-20 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Edit Project" description="Update project details" backHref="/admin/projects" />
      <div className="max-w-3xl">
        <ProjectForm form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} />
      </div>
    </div>
  );
}
