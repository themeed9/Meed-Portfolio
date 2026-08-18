import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resumeExperienceSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const experiences = await prisma.resumeExperience.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(experiences);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = resumeExperienceSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const maxOrder = await prisma.resumeExperience.aggregate({ _max: { order: true } });
    const experience = await prisma.resumeExperience.create({
      data: { ...parsed.data, order: parsed.data.order ?? (maxOrder._max.order ?? 0) + 1 },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
