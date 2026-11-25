import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkHomeSection, homeSectionByKey } from "@/lib/home-content-cms";

// Save or reset one homepage section (Admin → Content). Values are validated against the
// section's schema, and media and links are checked, before anything is stored.

type Context = { params: Promise<{ key: string }> };

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key } = await params;
  if (!homeSectionByKey(key)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  const body = await request.json().catch(() => null);
  const check = checkHomeSection(key, body?.value);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });
  const value = check.value as Prisma.InputJsonValue;
  await prisma.siteContent.upsert({ where: { key }, create: { key, value }, update: { value } });
  return NextResponse.json({ success: true, value });
}

/** Reset a section to the site's default copy by removing the stored value. */
export async function DELETE(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key } = await params;
  if (!homeSectionByKey(key)) return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  await prisma.siteContent.deleteMany({ where: { key } });
  return NextResponse.json({ success: true });
}
