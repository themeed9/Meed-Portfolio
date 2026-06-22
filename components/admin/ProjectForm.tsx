"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { UseFormReturn } from "react-hook-form";
import type { ProjectFormData } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface ProjectFormProps {
  form: UseFormReturn<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  isSubmitting: boolean;
}

export default function ProjectForm({ form, onSubmit, isSubmitting }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const coverImage = watch("coverImage");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("title", value);
    setValue("slug", slugify(value));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setValue("coverImage", data.url);
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Upload failed — check console for details");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sm:col-span-2">
          <Input label="Title *" placeholder="Project title" error={errors.title?.message} {...register("title", { onChange: handleTitleChange })} />
        </div>
        <Input label="Slug *" placeholder="project-slug" error={errors.slug?.message} {...register("slug")} />
        <Input label="Category *" placeholder="Product Design, UI/UX, etc." error={errors.category?.message} {...register("category")} />
      </div>

      {/* Cover image upload */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">Cover Image</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="block w-full text-sm text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-98 file:text-primary-safe hover:file:bg-primary-90 file:cursor-pointer cursor-pointer"
            />
            {uploading && <p className="text-xs text-on-surface-variant mt-1">Uploading...</p>}
            {uploadError && <p className="text-xs text-error mt-1">{uploadError}</p>}
            {coverImage && !uploading && !uploadError && (
              <p className="text-xs text-on-surface-variant mt-1 truncate">{coverImage}</p>
            )}
          </div>
          {coverImage && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant flex-shrink-0">
              <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
            </div>
          )}
        </div>
      </div>

      <Textarea label="Description *" placeholder="Short project description" rows={3} error={errors.description?.message} {...register("description")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Tags (comma separated)" placeholder="Figma, SaaS, Design System" {...register("tags")} />
        <Input label="Tools (comma separated)" placeholder="Figma, Framer, After Effects" {...register("tools")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Input label="Year" placeholder="2024" {...register("year")} />
        <Input label="Client" placeholder="Client name" {...register("client")} />
        <Input label="Duration" placeholder="3 months" {...register("duration")} />
      </div>

      <Input label="Role" placeholder="Lead Product Designer" {...register("role")} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input label="Live URL" placeholder="https://..." {...register("liveUrl")} />
        <Input label="GitHub URL" placeholder="https://..." {...register("githubUrl")} />
      </div>

      <Textarea label="Overview" placeholder="Project overview" rows={4} {...register("overview")} />
      <Textarea label="Challenge" placeholder="The challenge" rows={4} {...register("challenge")} />
      <Textarea label="Approach" placeholder="Your approach" rows={4} {...register("approach")} />
      <Textarea label="Results" placeholder="Key results and metrics" rows={4} {...register("results")} />

      <Textarea label="Testimonial" placeholder="Client testimonial" rows={3} {...register("testimonial")} />
      <Input label="Testimonial Author" placeholder="Jane Doe, CEO at Company" {...register("testimonialAuthor")} />

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" {...register("featured")} className="rounded border-border-default text-text-accent focus:ring-focus-ring/40 transition-colors cursor-pointer" />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" {...register("published")} className="rounded border-border-default text-text-accent focus:ring-focus-ring/40 transition-colors cursor-pointer" />
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Published</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
          Save Project
        </Button>
      </div>
    </form>
  );
}
