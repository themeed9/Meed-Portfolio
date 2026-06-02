"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema, type SkillFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function SkillForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema) as any,
  });

  const onSubmit = async (data: SkillFormData) => {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
        <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>Add Skill</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Skill">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Skill Name *" placeholder="e.g. Figma" error={errors.name?.message} {...register("name")} />
          <Input label="Category *" placeholder="e.g. Product Design" error={errors.category?.message} {...register("category")} />
          <Input label="Proficiency (0-100)" type="number" placeholder="85" error={errors.proficiency?.message} {...register("proficiency")} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Add Skill</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
