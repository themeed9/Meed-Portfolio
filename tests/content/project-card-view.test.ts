import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aspectRatioFor, buildCardView, cardColors, DEFAULT_CARD_PALETTE, galleryColumns } from "../../lib/project-card-view.ts";
import { contrastRatio } from "../../lib/project-card.ts";

const base = {
  id: "p1",
  title: "GoFinancial",
  slug: "gofinancial",
  description: "An expense tracker.",
  recruiterSummary: "Logging spending fast.",
  category: "Fintech",
  role: "Product Designer",
  status: "In development",
  coverImage: "https://res.cloudinary.com/x/cover.png",
};

describe("homepage card view model (ADR-010 phase 4)", () => {
  it("leads with the project title and numbers the label from the CMS order", () => {
    const view = buildCardView(base, 0);
    assert.equal(view.title, "GoFinancial");
    assert.equal(view.label, "01 / Fintech");
    assert.equal(buildCardView(base, 11).label, "12 / Fintech");
    assert.equal(view.summary, "Logging spending fast.");
    assert.equal(view.href, "/work/gofinancial");
    assert.equal(view.cta, "Read the case study");
  });

  it("falls back to media_split with role and status facts for a legacy project", () => {
    const view = buildCardView(base, 0);
    assert.equal(view.template, "media_split");
    assert.equal(view.fallback, true);
    assert.deepEqual(view.facts, [{ label: "Role", value: "Product Designer" }, { label: "Status", value: "In development" }]);
  });

  it("uses card facts and CTA from the payload when set", () => {
    const view = buildCardView({ ...base, cardTemplate: "statement", cardPayload: { statement: "One idea.", facts: [{ label: "Year", value: "2026" }], ctaLabel: "Read the story" } }, 0);
    assert.deepEqual(view.facts, [{ label: "Year", value: "2026" }]);
    assert.equal(view.cta, "Read the story");
  });

  it("fills the card with the project colour and auto-picks accessible text", () => {
    for (const hex of ["#1872F5", "#FF6900", "#1F7A4D", "#62C88F", "#FFFFFF", "#000000"]) {
      const colors = cardColors(hex);
      assert.ok(colors, hex);
      assert.ok(contrastRatio(colors.background, colors.text) >= 4.5, `${hex} text`);
      // Text on inner tinted panels is deep forest; it must pass too.
      assert.ok(contrastRatio(colors.surface, "#0B3D2E") >= 4.5, `${hex} surface ${colors.surface}`);
    }
    assert.equal(cardColors("#1872f5")?.text, "#000000");
    assert.equal(cardColors("#62C88F")?.text, "#0B3D2E");
  });

  it("gives cards without a saved colour the Figma palette in order", () => {
    assert.deepEqual([0, 1, 2, 3].map((i) => buildCardView(base, i).colors?.background), ["#1872F5", "#FF6900", "#0F7A44", "#1872F5"]);
    assert.equal(buildCardView({ ...base, primaryColor: "#62C88F" }, 0).colors?.background, "#62C88F");
    for (const hex of DEFAULT_CARD_PALETTE) assert.ok((cardColors(hex)?.ratio ?? 0) >= 4.5, hex);
  });

  it("ignores a missing or malformed colour instead of guessing", () => {
    assert.equal(cardColors(null), null);
    assert.equal(cardColors("blue"), null);
  });

  it("takes aspect ratios from stored dimensions so screens are never cropped", () => {
    assert.equal(aspectRatioFor({ width: 390, height: 844 }), "390 / 844");
    assert.equal(aspectRatioFor({}), "16 / 10");
    assert.equal(aspectRatioFor({}, "9 / 19.5"), "9 / 19.5");
  });

  it("chooses gallery columns that avoid a lone item where possible", () => {
    assert.deepEqual([3, 4, 5, 6, 7, 8, 9].map(galleryColumns), [3, 2, 3, 3, 3, 3, 3]);
  });
});
