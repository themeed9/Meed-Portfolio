import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const count = await prisma.service.count();
  const service = await prisma.service.create({
    data: {
      title: body.title,
      description: body.description,
      icon: body.icon || null,
      order: count + 1,
    },
  });

  return NextResponse.json(service, { status: 201 });
}
