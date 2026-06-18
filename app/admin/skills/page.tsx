import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import Button from "@/components/ui/Button";

export const dynamic = "force-dynamic";
import { Trash2, Plus } from "lucide-react";
import SkillForm from "./SkillForm";
import ServiceForm from "./ServiceForm";

async function deleteSkill(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  await prisma.skill.delete({ where: { id } });
}

async function deleteService(id: string) {
  "use server";
  const session = await auth();
  if (!session?.user) return;
  await prisma.service.delete({ where: { id } });
}

export default async function AdminSkillsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [skills, services] = await Promise.all([
    prisma.skill.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    prisma.service.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div>
      <AdminHeader title="Skills & Services" description="Manage your skills and service offerings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Skills</h2>
            <SkillForm />
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-text-tertiary py-8 text-center">No skills added yet.</p>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => (
                <div key={cat}>
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">{cat}</h3>
                  <div className="space-y-2">
                    {skills.filter((s) => s.category === cat).map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-primary border border-border-subtle">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-text-primary">{skill.name}</span>
                          <span className="text-xs text-text-tertiary">{skill.proficiency}%</span>
                        </div>
                        <form action={deleteSkill.bind(null, skill.id)}>
                          <button type="submit" className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-primary-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">Services</h2>
            <ServiceForm />
          </div>

          {services.length === 0 ? (
            <p className="text-sm text-text-tertiary py-8 text-center">No services added yet.</p>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="p-4 rounded-xl bg-surface-primary border border-border-subtle">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-text-primary text-sm">{service.title}</h3>
                      <p className="text-xs text-text-tertiary mt-1">{service.description}</p>
                    </div>
                    <form action={deleteService.bind(null, service.id)}>
                      <button type="submit" className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary hover:text-primary-base transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-focus-ring">
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
