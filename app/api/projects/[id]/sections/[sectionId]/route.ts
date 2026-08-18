import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { caseStudySectionInputSchema } from "@/lib/case-study";
import { Prisma } from "@prisma/client";

type Context = { params: Promise<{ id: string; sectionId: string }> };

export async function PUT(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId, sectionId } = await params;
  const parsed = caseStudySectionInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid section", details: parsed.error.flatten() }, { status: 400 });
  const { payload, metadata, ...data } = parsed.data;
  const result = await prisma.caseStudySection.updateMany({ where: { id: sectionId, projectId }, data: {
    ...data,
    payload: payload === undefined ? undefined : payload === null ? Prisma.JsonNull : payload as Prisma.InputJsonValue,
    metadata: metadata === undefined ? undefined : metadata === null ? Prisma.JsonNull : metadata as Prisma.InputJsonValue,
  } });
  if (!result.count) return NextResponse.json({ error: "Section not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId, sectionId } = await params;
  const result = await prisma.caseStudySection.deleteMany({ where: { id: sectionId, projectId } });
  if (!result.count) return NextResponse.json({ error: "Section not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
