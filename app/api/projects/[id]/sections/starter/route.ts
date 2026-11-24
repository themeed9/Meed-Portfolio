import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { caseStudyTemplates, convertedLegacyFields, isCaseStudyTemplate, legacyBlocks, type NewBlock } from "@/lib/case-study-blocks";

// Adds a set of blocks in one step (ADR-011):
// - { template }: a starter template, appended as hidden drafts;
// - { legacy: true }: the legacy Overview/Challenge/... text as blocks, placed first. Nothing is deleted.
const bodySchema = z.union([
  z.object({ template: z.string().refine(isCaseStudyTemplate, "Unknown template") }),
  z.object({ legacy: z.literal(true) }),
]);

const json = (value: unknown) => (value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue));

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: projectId } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a template or legacy conversion" }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { overview: true, challenge: true, approach: true, results: true, testimonial: true, testimonialAuthor: true, caseStudySections: { select: { id: true, order: true, metadata: true } } },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const existing = project.caseStudySections;
  let blocks: NewBlock[];
  let startAt: number;
  if ("template" in parsed.data) {
    blocks = [...caseStudyTemplates[parsed.data.template as keyof typeof caseStudyTemplates].blocks];
    startAt = existing.reduce((max, section) => Math.max(max, section.order + 1), 0);
  } else {
    blocks = legacyBlocks(project, convertedLegacyFields(existing));
    if (!blocks.length) return NextResponse.json({ error: "There is no legacy text left to convert" }, { status: 400 });
    startAt = 0;
  }

  const created = await prisma.$transaction(async (tx) => {
    if (startAt === 0 && existing.length) {
      for (const section of existing) await tx.caseStudySection.update({ where: { id: section.id }, data: { order: section.order + blocks.length } });
    }
    const rows = [];
    for (const [index, block] of blocks.entries()) {
      rows.push(await tx.caseStudySection.create({ data: {
        projectId, type: block.type, eyebrow: block.eyebrow, title: block.title, content: block.content,
        payload: json(block.payload), metadata: json(block.metadata), order: startAt + index,
      } }));
    }
    return rows;
  });
  return NextResponse.json(created, { status: 201 });
}
