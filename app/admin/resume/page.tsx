import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import ResumeExperienceForm from "./ResumeExperienceForm";
import DeleteButton from "./DeleteButton";
import ResumeUpload from "./ResumeUpload";

export const dynamic = "force-dynamic";

export default async function AdminResumePage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  let experiences: { id: string; year: string; title: string; company: string; description: string; order: number; createdAt: Date; updatedAt: Date }[] = [];
  try {
    experiences = await prisma.resumeExperience.findMany({
      orderBy: { order: "asc" },
    });
  } catch {
  }

  let resumeUrl: string | null = null;
  try {
    const resume = await prisma.resume.findFirst({ where: { active: true } });
    resumeUrl = resume?.fileUrl || null;
  } catch {
  }

  return (
    <div>
      <AdminHeader title="Resume" description="Manage your resume PDF and work experience entries" />

      <div className="mb-10 p-6 bg-surface-primary rounded-2xl border border-border-subtle">
        <h2 className="text-lg font-bold text-text-primary mb-4">Resume PDF</h2>
        <p className="text-sm text-text-tertiary mb-4">
          Upload your resume PDF. This will be available for download on the resume page.
        </p>
        <ResumeUpload currentUrl={resumeUrl} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-text-primary">Experience</h2>
        <ResumeExperienceForm />
      </div>

      {experiences.length === 0 ? (
        <p className="text-sm text-text-tertiary py-8 text-center">No experiences added yet.</p>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="p-4 rounded-xl bg-surface-primary border border-border-subtle">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium text-text-accent bg-primary-subtle px-2 py-0.5 rounded-md shrink-0">{exp.year}</span>
                    <span className="text-xs text-text-tertiary">Order: {exp.order}</span>
                  </div>
                  <h3 className="font-medium text-text-primary text-sm">{exp.title}</h3>
                  <p className="text-xs text-text-accent mb-1">{exp.company}</p>
                  <p className="text-xs text-text-tertiary leading-relaxed line-clamp-2">{exp.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-4 shrink-0">
                  <ResumeExperienceForm
                    experience={{ id: exp.id, year: exp.year, title: exp.title, company: exp.company, description: exp.description, order: exp.order }}
                  />
                  <DeleteButton id={exp.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
