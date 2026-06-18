import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import TestimonialForm from "./TestimonialForm";

export const dynamic = "force-dynamic";
import { Trash2, Star } from "lucide-react";

async function deleteTestimonial(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  await prisma.testimonial.delete({ where: { id } });
}

export default async function AdminTestimonialsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <div>
      <AdminHeader
        title="Testimonials"
        description="Manage client testimonials"
        action={<TestimonialForm />}
      />

      {testimonials.length === 0 ? (
        <p className="text-sm text-text-tertiary py-20 text-center">No testimonials yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="p-6 rounded-2xl bg-surface-primary border border-border-subtle">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center text-sm font-medium text-text-accent">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{t.name}</p>
                    {(t.role || t.company) && (
                      <p className="text-xs text-text-tertiary">{[t.role, t.company].filter(Boolean).join(" — ")}</p>
                    )}
                  </div>
                </div>
                <form action={deleteTestimonial.bind(null, t.id)}>
                  <button type="submit" className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-primary-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "text-primary-base fill-primary-base" : "text-border-strong"} />
                ))}
                {t.featured && <span className="ml-auto text-xs text-text-accent font-medium">Featured</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
