import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { caseStudySectionInputSchema } from "@/lib/case-study";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const reorderSchema = z.array(z.object({ id: z.string().min(1), order: z.number().int().min(0) }));

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;
  const parsed = caseStudySectionInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid section", details: parsed.error.flatten() }, { status: 400 });

  const { payload, metadata, ...data } = parsed.data;
  const section = await prisma.caseStudySection.create({ data: {
    projectId, ...data,
    payload: payload === undefined ? undefined : payload === null ? Prisma.JsonNull : payload as Prisma.InputJsonValue,
    metadata: metadata === undefined ? undefined : metadata === null ? Prisma.JsonNull : metadata as Prisma.InputJsonValue,
  } });
  return NextResponse.json(section, { status: 201 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;
  const parsed = reorderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid section order" }, { status: 400 });

  await prisma.$transaction(parsed.data.map((item) => prisma.caseStudySection.updateMany({ where: { id: item.id, projectId }, data: { order: item.order } })));
  return NextResponse.json({ success: true });
}
