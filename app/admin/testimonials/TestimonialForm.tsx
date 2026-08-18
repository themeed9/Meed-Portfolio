"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { formResolver } from "@/lib/form-resolver";
import { testimonialSchema, type TestimonialFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";

export default function TestimonialForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TestimonialFormData>({
    resolver: formResolver(testimonialSchema),
    defaultValues: { rating: 5, featured: true },
  });

  const onSubmit = async (data: TestimonialFormData) => {
    const res = await fetch("/api/testimonials", {
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
        <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>Add Testimonial</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Testimonial">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name *" placeholder="Client name" error={errors.name?.message} {...register("name")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Role" placeholder="CEO" {...register("role")} />
            <Input label="Company" placeholder="Company Name" {...register("company")} />
          </div>
          <Textarea label="Testimonial *" placeholder="What they said..." rows={4} error={errors.content?.message} {...register("content")} />
          <Input label="Rating (1-5)" type="number" placeholder="5" error={errors.rating?.message} {...register("rating")} />
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("featured")} className="rounded border-border-default text-text-accent" />
            <span className="text-sm text-text-secondary">Featured on homepage</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Add Testimonial</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
