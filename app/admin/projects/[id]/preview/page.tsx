import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CaseStudyLayout from "@/components/projects/CaseStudyLayout";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Admin-only preview of a case study, including unpublished projects and hidden draft blocks
// (ADR-011). The /admin proxy already requires an admin session; this checks again on the server.
export const dynamic = "force-dynamic";
export const metadata = { title: "Case study preview", robots: { index: false, follow: false } };

export default async function CaseStudyPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin/login");
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, caseStudySections: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();
  return (
    <div>
      <div className="case-preview-bar" role="status">
        <p><strong>Preview.</strong> {project.published ? "This project is published." : "This project is not published yet."} Hidden blocks are shown with a label and are not on the public page.</p>
        <div className="flex gap-4">
          <Link href={`/admin/projects/${project.id}/edit`}>Back to editing</Link>
          {project.published && <Link href={`/work/${project.slug}`}>Open public page</Link>}
        </div>
      </div>
      <CaseStudyLayout project={{ ...project, coverImage: project.heroImage || project.coverImage }} preview />
    </div>
  );
}
