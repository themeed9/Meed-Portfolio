"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormData } from "@/lib/validations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";

export default function ServiceForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema) as any,
  });

  const onSubmit = async (data: ServiceFormData) => {
    const res = await fetch("/api/services", {
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
        <span className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>Add Service</span>
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Service">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Service Title *" placeholder="e.g. Product Design" error={errors.title?.message} {...register("title")} />
          <Textarea label="Description *" placeholder="Describe this service" rows={3} error={errors.description?.message} {...register("description")} />
          <Input label="Icon Name" placeholder="e.g. Palette, PenTool, Layers" {...register("icon")} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>Add Service</Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
