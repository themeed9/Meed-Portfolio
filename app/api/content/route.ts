import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const content = await prisma.siteContent.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.key !== "string" || !body.key.trim() || !body.value || typeof body.value !== "object") return NextResponse.json({ error: "A key and JSON object are required" }, { status: 400 });
    const entry = await prisma.siteContent.create({ data: { key: body.key.trim(), value: body.value } });
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Content entry could not be created" }, { status: 400 });
  }
}
