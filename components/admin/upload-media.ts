// Signed upload through /api/upload (SEC-INV-006: type, signature and size checked on the server).
export async function uploadMedia(file: File): Promise<{ url: string; alt: string } | { error: string }> {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    if (!response.ok || typeof data.url !== "string") return { error: data.error || "Upload failed" };
    return { url: data.url, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") };
  } catch {
    return { error: "Upload failed" };
  }
}

export const UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
