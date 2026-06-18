import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const entry = await prisma.siteContent.findUnique({ where: { key: "homepage-hero" } });
  const value = entry?.value as Record<string, unknown> | undefined;
  const slides = (value?.slides as { src: string; alt: string }[]) ?? [];
  return NextResponse.json(slides);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slides = body.slides ?? [];

    const existing = await prisma.siteContent.findUnique({ where: { key: "homepage-hero" } });
    if (!existing) {
      return NextResponse.json({ error: "Hero content not found" }, { status: 404 });
    }

    const currentValue = existing.value as Record<string, unknown>;
    const updated = await prisma.siteContent.update({
      where: { id: existing.id },
      data: { value: { ...currentValue, slides } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Hero slides error:", error);
    return NextResponse.json({ error: "Failed to save slides" }, { status: 500 });
  }
}
