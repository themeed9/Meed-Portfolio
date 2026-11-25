import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkHomeSection, cleanHomeValue, editableValue, homeSectionByKey, homeSections } from "../../lib/home-content-cms.ts";
import { homeHeroSchema, homeStripSchema } from "../../lib/home-content.ts";

describe("Admin → Content section forms (owner request, 2026-11-25)", () => {
  it("covers every homepage section on the live site, in page order, plus the brand page", () => {
    assert.deepEqual(homeSections.map((s) => s.key), ["home-hero", "home-strip", "home-more-work", "home-about", "home-beyond", "home-contact", "site-footer", "brand-page"]);
  });

  it("round-trips every section's live default through its form without losing a field", () => {
    for (const section of homeSections) {
      const value = editableValue(section, null);
      const saved = cleanHomeValue(section.fields, value);
      const check = checkHomeSection(section.key, saved);
      assert.ok(check.ok, `${section.key}: ${check.ok ? "" : check.error}`);
      assert.deepEqual(check.ok && check.value, section.schema.parse(section.fallback), section.key);
    }
  });

  it("drops empty optional text, empty media and empty list rows before saving", () => {
    const hero = homeSectionByKey("home-hero")!;
    const cleaned = cleanHomeValue(hero.fields, { ...editableValue(hero, null), rolesLink: "  ", image: { src: "", alt: "" } });
    assert.equal("rolesLink" in cleaned, false);
    assert.equal("image" in cleaned, false);
    const strip = homeSectionByKey("home-strip")!;
    assert.deepEqual(cleanHomeValue(strip.fields, { placeholders: [{ title: "", note: "", href: "" }], hiddenProjects: ["a", "a", ""] }), { hiddenProjects: ["a"], placeholders: [] });
  });

  it("lets carousel tiles carry an image or video and a link, and hide projects", () => {
    const value = { hiddenProjects: ["gofinancial"], placeholders: [{ title: "ClinIQ", note: "Live site", href: "https://example.com", media: { src: "https://res.cloudinary.com/demo/video/upload/v1/clip.mp4", alt: "ClinIQ demo", kind: "video" } }] };
    const check = checkHomeSection("home-strip", value);
    assert.ok(check.ok, check.ok ? "" : check.error);
    assert.ok(homeStripSchema.safeParse(value).success);
  });

  it("keeps older saved values valid (image as { src, alt })", () => {
    assert.ok(homeHeroSchema.safeParse({ ...homeSectionByKey("home-hero")!.fallback as object, image: { src: "/uploads/a.png", alt: "Screen" } }).success);
  });

  it("shows an older Beyond episode videoUrl in the new media field", () => {
    const beyond = homeSectionByKey("home-beyond")!;
    const value = editableValue(beyond, { ...(beyond.fallback as object), ai: { ...(beyond.fallback as { ai: object }).ai, videoUrl: "https://res.cloudinary.com/x/video/upload/ep1.mp4" } });
    assert.deepEqual((value.ai as { media: unknown }).media, { src: "https://res.cloudinary.com/x/video/upload/ep1.mp4", alt: "The AI That Oversabi video", kind: "video" });
  });
});

describe("homepage media display (fill or whole)", () => {
  it("keeps the chosen fit, so a GIF can fill the hero frame", () => {
    const hero = homeSectionByKey("home-hero")!;
    const value = cleanHomeValue(hero.fields, { ...editableValue(hero, null), image: { src: "/uploads/loop.gif", alt: "Loop", fit: "cover" } });
    assert.deepEqual(value.image, { src: "/uploads/loop.gif", alt: "Loop", fit: "cover" });
    assert.ok(checkHomeSection("home-hero", value).ok);
  });

  it("never stores a fit on the background photo, and rejects unknown fits", () => {
    const hero = homeSectionByKey("home-hero")!;
    const value = cleanHomeValue(hero.fields, { ...editableValue(hero, null), background: { src: "/images/hero-sky.webp", alt: "", fit: "cover" } });
    assert.equal("fit" in (value.background as object), false);
    assert.equal(checkHomeSection("home-hero", { ...value, image: { src: "/uploads/a.gif", alt: "A", fit: "stretch" } }).ok, false);
  });
});

describe("Admin → Content save checks", () => {
  const hero = homeSectionByKey("home-hero")!;
  const base = () => cleanHomeValue(hero.fields, editableValue(hero, null));

  it("names a required field left empty", () => {
    const check = checkHomeSection("home-hero", { ...base(), headline: "" });
    assert.equal(check.ok, false);
    assert.match(check.ok ? "" : check.error, /Hero: Headline is required/);
    const link = checkHomeSection("home-strip", { placeholders: [{ title: "A", note: "B", href: "javascript:x" }] });
    assert.match(link.ok ? "" : link.error, /Extra tiles › tile 1 › Link \(optional\): links must start/);
  });

  it("rejects media from hosts the site cannot show, and unsafe links", () => {
    assert.equal(checkHomeSection("home-hero", { ...base(), image: { src: "https://evil.example/a.png", alt: "x" } }).ok, false);
    assert.equal(checkHomeSection("home-hero", { ...base(), image: { src: "javascript:alert(1)", alt: "x" } }).ok, false);
    assert.equal(checkHomeSection("home-hero", { ...base(), ctaLink: "javascript:alert(1)" }).ok, false);
    assert.equal(checkHomeSection("home-strip", { placeholders: [{ title: "A", note: "B", href: "//evil.example" }] }).ok, false);
  });

  it("refuses unknown sections", () => {
    assert.equal(checkHomeSection("site-settings", {}).ok, false);
  });
});
