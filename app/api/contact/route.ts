import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { contactFormSchema } from "@/lib/validations";
import { sendContactNotification } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid form data", details: validated.error.flatten() }, { status: 400 });
    }

    const { name, email, subject, message } = validated.data;

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Send email notification to the configured contact email
    const settings = await prisma.siteContent.findUnique({ where: { key: "site-settings" } });
    const contactEmail = String((settings?.value as any)?.contactEmail || process.env.CONTACT_EMAIL || "");

    if (contactEmail) {
      sendContactNotification({ name, email, subject, message, recipientEmail: contactEmail }).catch(
        (err) => console.error("Failed to send email notification:", err),
      );
    }

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
