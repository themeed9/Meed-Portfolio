import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const resume = await prisma.resume.findFirst({ where: { active: true } });
  return NextResponse.json(resume ?? { fileUrl: null });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Deactivate all existing resumes, then create a new one
    await prisma.resume.updateMany({ data: { active: false } });

    const resume = await prisma.resume.create({
      data: {
        fileUrl: body.fileUrl,
        version: body.version || "1.0",
        active: true,
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Resume update error:", error);
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
