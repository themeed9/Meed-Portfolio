import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
      include: { images: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = projectSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid data", details: validated.error.flatten() }, { status: 400 });
    }

    const data = validated.data;
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        category: data.category,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        coverImage: data.coverImage || null,
        liveUrl: data.liveUrl || null,
        githubUrl: data.githubUrl || null,
        featured: data.featured,
        published: data.published,
        year: data.year || null,
        client: data.client || null,
        role: data.role || null,
        duration: data.duration || null,
        tools: data.tools ? data.tools.split(",").map((t) => t.trim()).filter(Boolean) : [],
        overview: data.overview || null,
        challenge: data.challenge || null,
        approach: data.approach || null,
        results: data.results || null,
        testimonial: data.testimonial || null,
        testimonialAuthor: data.testimonialAuthor || null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
