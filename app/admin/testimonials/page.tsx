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
        <p className="text-sm text-gray-400 py-20 text-center">No testimonials yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                    {(t.role || t.company) && (
                      <p className="text-xs text-gray-500">{[t.role, t.company].filter(Boolean).join(" — ")}</p>
                    )}
                  </div>
                </div>
                <form action={deleteTestimonial.bind(null, t.id)}>
                  <button type="submit" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/40">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"} />
                ))}
                {t.featured && <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">Featured</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
