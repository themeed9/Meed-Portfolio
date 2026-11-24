import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_PDF_BYTES, PDF_TYPE, extensionOf, matchesSignature } from "@/lib/upload-signature";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Media storage is not configured." }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const extension = extensionOf(file.name);
    const imageExtensions = IMAGE_TYPES.get(file.type);
    const isImage = Boolean(imageExtensions?.has(extension));
    const isPdf = file.type === PDF_TYPE && extension === "pdf";
    if (!isImage && !isPdf) {
      return NextResponse.json({ error: "Unsupported file. Use JPG, JPEG, PNG, WebP, AVIF, GIF, or PDF." }, { status: 415 });
    }

    const limit = isPdf ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (file.size === 0 || file.size > limit) {
      return NextResponse.json({ error: `File must be smaller than ${limit / 1024 / 1024} MB.` }, { status: 413 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!matchesSignature(bytes, file.type)) {
      return NextResponse.json({ error: "File contents do not match the declared format." }, { status: 415 });
    }

    const resourceType = isPdf ? "raw" : "image";
    const folder = isPdf ? "meed-portfolio/resumes" : "meed-portfolio/images";
    const publicId = randomUUID();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureSource = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(signatureSource).digest("hex");
    const upload = new FormData();
    upload.append("file", new Blob([bytes], { type: file.type }), `${publicId}.${extension}`);
    upload.append("api_key", apiKey);
    upload.append("timestamp", timestamp);
    upload.append("folder", folder);
    upload.append("public_id", publicId);
    upload.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`, {
      method: "POST",
      body: upload,
    });
    const result: unknown = await response.json();
    if (!response.ok || !result || typeof result !== "object" || !("secure_url" in result) || typeof result.secure_url !== "string") {
      return NextResponse.json({ error: "Durable media upload failed." }, { status: 502 });
    }

    // Image dimensions come from Cloudinary's own response (ADR-010); nothing extra is signed.
    const dimension = (key: "width" | "height") => {
      const value = (result as Record<string, unknown>)[key];
      return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
    };

    return NextResponse.json({
      url: result.secure_url,
      filename: `${publicId}.${extension}`,
      size: file.size,
      type: file.type,
      width: isPdf ? undefined : dimension("width"),
      height: isPdf ? undefined : dimension("height"),
    });
  } catch (error) {
    console.error("Upload failed", error instanceof Error ? error.message : "Unknown upload error");
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
