import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resumeExperienceSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  const db = prisma as any;
  if (!db.resumeExperience) {
    throw new Error(
      "ResumeExperience model not available in Prisma client. Run `npx prisma generate` then restart the dev server."
    );
  }
  return db;
}

export async function GET() {
  try {
    const db = await getPrisma();
    const experiences = await db.resumeExperience.findMany({
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

    const db = await getPrisma();
    const maxOrder = await db.resumeExperience.aggregate({ _max: { order: true } });
    const experience = await db.resumeExperience.create({
      data: { ...parsed.data, order: parsed.data.order ?? (maxOrder._max.order ?? 0) + 1 },
    });

    return NextResponse.json(experience, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
