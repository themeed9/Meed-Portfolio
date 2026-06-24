import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const entry = await prisma.siteContent.findUnique({ where: { key: "site-settings" } });
  const defaults = {
    logoUrl: null,
    siteName: "MEED",
    ctaBgImage: null,
    footerBgImage: null,
    aboutImage: null,
    contactEmail: process.env.CONTACT_EMAIL || "",
  };
  return NextResponse.json(entry?.value ?? defaults);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const value = {
      logoUrl: body.logoUrl || null,
      siteName: body.siteName || "MEED",
      ctaBgImage: body.ctaBgImage || null,
      footerBgImage: body.footerBgImage || null,
      aboutImage: body.aboutImage || null,
      contactEmail: body.contactEmail || process.env.CONTACT_EMAIL || "",
    };

    const entry = await prisma.siteContent.upsert({
      where: { key: "site-settings" },
      update: { value },
      create: { key: "site-settings", value },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
