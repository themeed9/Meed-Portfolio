import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const count = await prisma.testimonial.count();
  const testimonial = await prisma.testimonial.create({
    data: {
      name: body.name,
      role: body.role || null,
      company: body.company || null,
      content: body.content,
      rating: parseInt(body.rating) || 5,
      featured: body.featured ?? true,
      order: count + 1,
    },
  });

  return NextResponse.json(testimonial, { status: 201 });
}
