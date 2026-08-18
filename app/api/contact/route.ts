import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { contactFormSchema } from "@/lib/validations";
import { sendContactNotification } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { createHash } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 20_000) return NextResponse.json({ error: "Request too large." }, { status: 413 });

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
    const rate = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > 20_000) return NextResponse.json({ error: "Request too large." }, { status: 413 });
    const body: unknown = JSON.parse(rawBody);
    const validated = contactFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid form data", details: validated.error.flatten() }, { status: 400 });
    }

    const { name, email, subject, message, website } = validated.data;
    if (website) return NextResponse.json({ success: true }, { status: 200 });

    const fingerprint = createHash("sha256").update(`${ip}:${email}:${message}`).digest("hex");
    const duplicate = checkRateLimit(`contact-duplicate:${fingerprint}`, 1, 60 * 1000);
    if (!duplicate.allowed) {
      return NextResponse.json({ error: "This message was already submitted." }, { status: 429 });
    }

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Send email notification to the configured contact email
    const settings = await prisma.siteContent.findUnique({ where: { key: "site-settings" } });
    const settingsValue = settings?.value && typeof settings.value === "object" && !Array.isArray(settings.value) ? settings.value : null;
    const storedEmail = settingsValue && "contactEmail" in settingsValue && typeof settingsValue.contactEmail === "string" ? settingsValue.contactEmail : "";
    const contactEmail = storedEmail || process.env.CONTACT_EMAIL || "";

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
