// Upload type rules for app/api/upload (SEC-INV-006): allowed MIME types, MIME/extension agreement,
// magic-byte signatures and size caps. Kept separate so the rules are unit-tested.

export const IMAGE_TYPES = new Map([
  ["image/jpeg", new Set(["jpg", "jpeg"])],
  ["image/png", new Set(["png"])],
  ["image/webp", new Set(["webp"])],
  ["image/avif", new Set(["avif"])],
  // Animated media for card containers (ADR-010). Same 12 MB cap and signature check as other images.
  ["image/gif", new Set(["gif"])],
]);
export const PDF_TYPE = "application/pdf";
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_PDF_BYTES = 5 * 1024 * 1024;

export function extensionOf(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

export function matchesSignature(bytes: Uint8Array, mime: string) {
  const text = (start: number, end: number) => new TextDecoder().decode(bytes.slice(start, end));
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/png") return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index]);
  if (mime === "image/webp") return text(0, 4) === "RIFF" && text(8, 12) === "WEBP";
  if (mime === "image/avif") return text(4, 12).includes("ftypavif") || text(4, 12).includes("ftypavis");
  if (mime === "image/gif") return text(0, 6) === "GIF87a" || text(0, 6) === "GIF89a";
  if (mime === PDF_TYPE) return text(0, 5) === "%PDF-";
  return false;
}
