"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { projectSchema, type ProjectFormData } from "@/lib/validations";
import AdminHeader from "@/components/layout/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";
import CaseStudySectionEditor, { type EditableSection } from "@/components/admin/CaseStudySectionEditor";
import ProjectMediaEditor from "@/components/admin/ProjectMediaEditor";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sections, setSections] = useState<EditableSection[]>([]);
  const [images, setImages] = useState<Array<{id:string;url:string;alt:string|null;caption:string|null;order:number}>>([]);
  const form = useForm<ProjectFormData>({
    resolver: formResolver(projectSchema),
  });

  useEffect(() => {
    fetch(`/api/projects/${params.id}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (!data || typeof data !== "object") throw new Error("Invalid project response");
        const project = data as Record<string, unknown>;
        setSections(Array.isArray(project.caseStudySections) ? project.caseStudySections as EditableSection[] : []);
        setImages(Array.isArray(project.images) ? project.images as Array<{id:string;url:string;alt:string|null;caption:string|null;order:number}> : []);
        const text = (key: string) => typeof project[key] === "string" ? project[key] : "";
        const list = (key: string) => Array.isArray(project[key]) ? (project[key] as unknown[]).filter((item): item is string => typeof item === "string").join(", ") : "";
        form.reset({
          title: text("title"), slug: text("slug"), description: text("description"), recruiterSummary: text("recruiterSummary"), status: text("status"), platform: text("platform"), category: text("category"),
          tags: list("tags"), coverImage: text("coverImage"), homepageImage: text("homepageImage"), heroImage: text("heroImage"), liveUrl: text("liveUrl"), githubUrl: text("githubUrl"),
          featured: project.featured === true, published: project.published === true, year: text("year"), client: text("client"),
          role: text("role"), duration: text("duration"), tools: list("tools"), overview: text("overview"), challenge: text("challenge"),
          approach: text("approach"), results: text("results"), testimonial: text("testimonial"), testimonialAuthor: text("testimonialAuthor"), order: typeof project.order === "number" ? project.order : 0,
        });
        setIsLoading(false);
      });
  }, [params.id, form]);

  const onSubmit = async (data: ProjectFormData) => {
    setError("");
    const res = await fetch(`/api/projects/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/projects");
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Failed to update project");
    }
  };

  if (isLoading) {
    return (
      <div>
        <AdminHeader title="Edit Project" backHref="/admin/projects" />
        <div className="text-center py-20 text-text-tertiary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Edit Project" description="Update project details" backHref="/admin/projects" />
      <div className="max-w-3xl">
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
        <ProjectForm form={form} onSubmit={onSubmit} isSubmitting={form.formState.isSubmitting} />
        <ProjectMediaEditor projectId={String(params.id)} initialImages={images} />
        <CaseStudySectionEditor projectId={String(params.id)} initialSections={sections} />
      </div>
    </div>
  );
}
