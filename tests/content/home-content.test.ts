import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beyondSchema, homeAboutSchema, homeContactSchema, homeDefaults, homeHeroSchema, homeStripSchema, moreWorkSchema, resolveContent, safeHref, stripPlaceholders } from "../../lib/home-content.ts";

describe("homepage content (ADR-010 phase 5)", () => {
  it("ships defaults that pass their own schemas", () => {
    assert.equal(homeHeroSchema.safeParse(homeDefaults.hero).success, true);
    assert.equal(moreWorkSchema.safeParse(homeDefaults.moreWork).success, true);
    assert.equal(homeStripSchema.safeParse(homeDefaults.strip).success, true);
    assert.equal(homeAboutSchema.safeParse(homeDefaults.about).success, true);
    assert.equal(beyondSchema.safeParse(homeDefaults.beyond).success, true);
    assert.equal(homeContactSchema.safeParse(homeDefaults.contact).success, true);
  });

  it("uses CMS content when it is valid", () => {
    const custom = { ...homeDefaults.hero, headline: "A new headline from the CMS." };
    assert.equal(resolveContent(homeHeroSchema, custom, homeDefaults.hero).headline, "A new headline from the CMS.");
  });

  it("falls back to the default when CMS content is missing or invalid", () => {
    assert.equal(resolveContent(homeHeroSchema, null, homeDefaults.hero), homeDefaults.hero);
    assert.equal(resolveContent(homeHeroSchema, { headline: "" }, homeDefaults.hero), homeDefaults.hero);
    assert.equal(resolveContent(homeContactSchema, { headline: "Hi", email: "not-an-email" }, homeDefaults.contact), homeDefaults.contact);
  });

  it("renders only safe link targets", () => {
    assert.equal(safeHref("/work/gofinancial"), "/work/gofinancial");
    assert.equal(safeHref("#selected-work"), "#selected-work");
    assert.equal(safeHref("https://example.com"), "https://example.com");
    assert.equal(safeHref("mailto:hello@example.com"), "mailto:hello@example.com");
    assert.equal(safeHref("javascript:alert(1)"), null);
    assert.equal(safeHref("//evil.example"), null);
    assert.equal(safeHref("http://insecure.example"), null);
    assert.equal(safeHref(undefined), null);
  });

  it("keeps More work rows without a URL as plain rows", () => {
    const rows = homeDefaults.moreWork.items.map((item) => safeHref("href" in item ? item.href : undefined));
    assert.deepEqual(rows, ["/work/backrock-insurance", null, "/brand", null]);
  });

  it("fills the strip with placeholders only where no real project exists", () => {
    const left = stripPlaceholders(homeDefaults.strip, ["GoFinancial", "Solar-8 (sample)", "SecureGate"]).map((item) => item.title);
    assert.deepEqual(left, ["ClinIQ", "KudiPouch", "AI-built WordPress site", "Meed Cordwainer", "Next case study"]);
  });
});
