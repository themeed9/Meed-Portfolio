import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ICON_OPTIONS = ["linkedin", "twitter", "dribbble", "github"];

export async function GET() {
  try {
    const links = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(links);
  } catch {
    const { fallbackSocialLinks } = await import("@/lib/defaults");
    return NextResponse.json(fallbackSocialLinks);
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const links: { platform: string; url: string; icon: string; order: number }[] = body.links ?? [];

    await prisma.socialLink.deleteMany();

    if (links.length > 0) {
      await prisma.socialLink.createMany({
        data: links.map((link, i) => ({
          platform: link.platform,
          url: link.url,
          icon: ICON_OPTIONS.includes(link.icon?.toLowerCase()) ? link.icon.toLowerCase() : null,
          order: link.order ?? i,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social links error:", error);
    return NextResponse.json({ error: "Failed to save social links" }, { status: 500 });
  }
}
