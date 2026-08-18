import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectSchema } from "@/lib/validations";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: session?.user?.role === "admin" ? { id } : { id, published: true },
    include: { images: { orderBy: { order: "asc" } }, caseStudySections: { orderBy: { order: "asc" } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = projectSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      description: body.description,
      recruiterSummary: body.recruiterSummary || null,
      status: body.status || null,
      platform: body.platform || null,
      category: body.category,
      tags: body.tags ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      coverImage: body.coverImage || null,
      homepageImage: body.homepageImage || null,
      heroImage: body.heroImage || null,
      liveUrl: body.liveUrl || null,
      githubUrl: body.githubUrl || null,
      featured: body.featured,
      published: body.published,
      year: body.year || null,
      client: body.client || null,
      role: body.role || null,
      duration: body.duration || null,
      tools: body.tools ? body.tools.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      order: body.order,
      overview: body.overview || null,
      challenge: body.challenge || null,
      approach: body.approach || null,
      results: body.results || null,
      testimonial: body.testimonial || null,
      testimonialAuthor: body.testimonialAuthor || null,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
