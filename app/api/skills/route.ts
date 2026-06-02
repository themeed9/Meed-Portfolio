import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const count = await prisma.skill.count();
  const skill = await prisma.skill.create({
    data: {
      name: body.name,
      category: body.category,
      proficiency: parseInt(body.proficiency) || 80,
      order: count + 1,
    },
  });

  return NextResponse.json(skill, { status: 201 });
}
