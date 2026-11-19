import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { IMAGE_TYPES, extensionOf, matchesSignature } from "../../lib/upload-signature.ts";

const bytes = (...parts: (string | number[])[]) => new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...new TextEncoder().encode(p)] : p)));

describe("upload signatures (SEC-INV-006)", () => {
  it("accepts real GIF87a and GIF89a files", () => {
    assert.equal(matchesSignature(bytes("GIF89a", [1, 0, 1, 0]), "image/gif"), true);
    assert.equal(matchesSignature(bytes("GIF87a", [1, 0, 1, 0]), "image/gif"), true);
  });

  it("rejects a file disguised as a GIF", () => {
    assert.equal(matchesSignature(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/gif"), false);
    assert.equal(matchesSignature(bytes("<svg onload=alert(1)>"), "image/gif"), false);
  });

  it("keeps the existing image and PDF checks", () => {
    assert.equal(matchesSignature(bytes([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg"), true);
    assert.equal(matchesSignature(bytes("%PDF-1.7"), "application/pdf"), true);
    assert.equal(matchesSignature(bytes("GIF89a"), "image/png"), false);
  });

  it("requires the extension to match the MIME type and allows no SVG or video uploads", () => {
    assert.equal(IMAGE_TYPES.get("image/gif")?.has(extensionOf("flow.GIF")), true);
    assert.equal(IMAGE_TYPES.get("image/gif")?.has(extensionOf("flow.png")), false);
    assert.equal(IMAGE_TYPES.has("image/svg+xml"), false);
    assert.equal(IMAGE_TYPES.has("video/mp4"), false);
  });
});
