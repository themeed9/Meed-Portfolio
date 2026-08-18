"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { resumeExperienceSchema, type ResumeExperienceFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";

interface Props {
  experience?: {
    id: string;
    year: string;
    title: string;
    company: string;
    description: string;
    order: number;
  };
}

export default function ResumeExperienceForm({ experience }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const isEditing = !!experience;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ResumeExperienceFormData>({
    resolver: formResolver(resumeExperienceSchema),
    defaultValues: experience ? {
      year: experience.year,
      title: experience.title,
      company: experience.company,
      description: experience.description,
      order: experience.order,
    } : undefined,
  });

  const onSubmit = async (data: ResumeExperienceFormData) => {
    setApiError("");
    const res = await fetch(
      isEditing ? `/api/resume-experiences/${experience!.id}` : "/api/resume-experiences",
      {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (res.ok) {
      reset();
      setIsOpen(false);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      setApiError(err.error || "Failed to save. Check console for details.");
    }
  };

  return (
    <>
      {isEditing ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-primary-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </button>
      ) : (
        <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
          <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>Add Experience</span>
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={isEditing ? "Edit Experience" : "Add Experience"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Year *" placeholder="e.g. 2024 - Present" error={errors.year?.message} {...register("year")} />
          <Input label="Title *" placeholder="e.g. Senior Product Designer" error={errors.title?.message} {...register("title")} />
          <Input label="Company *" placeholder="e.g. Freelance / Studio" error={errors.company?.message} {...register("company")} />
          <Textarea label="Description *" placeholder="Describe the role" rows={3} error={errors.description?.message} {...register("description")} />
          <Input label="Order" type="number" placeholder="0" error={errors.order?.message} {...register("order")} />
          {apiError && <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">{apiError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {isEditing ? "Save Changes" : "Add Experience"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
