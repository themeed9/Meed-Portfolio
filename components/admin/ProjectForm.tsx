"use client";

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
  const { register, handleSubmit, formState: { errors }, setValue } = form;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("title", value);
    setValue("slug", slugify(value));
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
          <input type="checkbox" {...register("featured")} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/40 transition-colors cursor-pointer" />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Featured</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" {...register("published")} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/40 transition-colors cursor-pointer" />
          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Published</span>
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
