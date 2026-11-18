import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  cardSkeleton,
  cardTemplates,
  cleanCardPayload,
  contrastRatio,
  normalizeCard,
  pickTextColor,
  relativeLuminance,
  resolveCardInput,
  tint,
  TEXT_ON_COLOR_CANDIDATES,
} from "../../lib/project-card.ts";
import { projectSchema } from "../../lib/validations.ts";

const media = (n: number) => Array.from({ length: n }, (_, i) => ({ url: `https://res.cloudinary.com/x/${i}.png`, alt: `Screen ${i}` }));

describe("WCAG contrast helpers (ADR-010)", () => {
  it("computes the reference luminances and the 21:1 maximum", () => {
    assert.equal(relativeLuminance("#FFFFFF"), 1);
    assert.equal(relativeLuminance("#000000"), 0);
    assert.equal(Math.round(contrastRatio("#FFFFFF", "#000000") * 100) / 100, 21);
    assert.equal(contrastRatio("#1872F5", "#FFFFFF"), contrastRatio("#FFFFFF", "#1872F5"));
  });

  it("picks black on GoFinancial blue #1872F5, where white and near-black fall short", () => {
    assert.ok(contrastRatio("#1872F5", "#FFFFFF") < 4.5);
    assert.ok(contrastRatio("#1872F5", "#07100B") < 4.5);
    const { color, ratio } = pickTextColor("#1872F5");
    assert.equal(color, "#000000");
    assert.ok(ratio >= 4.5);
  });

  it("picks near-black on Solar-8 orange #FF6900", () => {
    const { color, ratio } = pickTextColor("#FF6900");
    assert.equal(color, "#07100B");
    assert.ok(ratio >= 4.5);
  });

  it("picks white on a mid-tone green (SecureGate placeholder)", () => {
    const { color, ratio } = pickTextColor("#1F7A4D");
    assert.equal(color, "#FFFFFF");
    assert.ok(ratio >= 4.5);
  });

  it("always reaches 4.5:1 across the whole grey ramp and extreme hues", () => {
    const samples = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#257A4C", "#62C88F"];
    for (let v = 0; v <= 255; v += 5) samples.push(`#${v.toString(16).padStart(2, "0").repeat(3)}`);
    for (const hex of samples) {
      const { color, ratio } = pickTextColor(hex);
      assert.ok(TEXT_ON_COLOR_CANDIDATES.includes(color as (typeof TEXT_ON_COLOR_CANDIDATES)[number]), hex);
      assert.ok(ratio >= 4.5, `${hex} -> ${color} at ${ratio.toFixed(2)}`);
    }
  });

  it("rejects malformed colours instead of guessing", () => {
    assert.throws(() => pickTextColor("blue"));
    assert.throws(() => pickTextColor("#FFF"));
  });

  it("tints towards white and clamps the amount", () => {
    assert.equal(tint("#000000", 0.5), "#808080");
    assert.equal(tint("#1872F5", 0), "#1872F5");
    assert.equal(tint("#1872F5", 2), "#FFFFFF");
  });
});

describe("homepage card normalization and fallback (ADR-010)", () => {
  const base = { title: "GoFinancial", coverImage: "https://res.cloudinary.com/x/cover.png", homepageImage: null };

  it("offers exactly the five approved templates", () => {
    assert.deepEqual([...cardTemplates], ["media_split", "device_stage", "gallery_grid", "process_flow", "statement"]);
  });

  it("falls back to media_split from the cover image for a legacy project with no card data", () => {
    const card = normalizeCard(base);
    assert.equal(card.template, "media_split");
    assert.equal(card.fallback, true);
    assert.deepEqual(card.payload, { image: { url: base.coverImage, alt: "GoFinancial preview" } });
  });

  it("prefers the homepage image over the cover in the fallback", () => {
    const card = normalizeCard({ ...base, homepageImage: "https://res.cloudinary.com/x/home.png" });
    assert.equal(card.template === "media_split" && card.payload.image?.url, "https://res.cloudinary.com/x/home.png");
  });

  it("falls back with an empty payload when there is no image at all", () => {
    const card = normalizeCard({ title: "Draft", cardTemplate: "unknown" });
    assert.deepEqual(card, { template: "media_split", payload: {}, fallback: true });
  });

  it("falls back for an unknown template without throwing", () => {
    assert.equal(normalizeCard({ ...base, cardTemplate: "carousel", cardPayload: {} }).fallback, true);
  });

  it("falls back for an invalid payload without throwing", () => {
    const card = normalizeCard({ ...base, cardTemplate: "device_stage", cardPayload: { screens: [] } });
    assert.equal(card.template, "media_split");
    assert.equal(card.fallback, true);
  });

  it("accepts a valid payload for each template", () => {
    const payloads = {
      media_split: { image: media(1)[0], facts: [{ label: "Role", value: "Product Designer" }] },
      device_stage: { screens: media(3), targets: [{ value: "5 sec", caption: "to log a spend" }] },
      gallery_grid: { items: media(6), labels: ["I know what I need", "I need guidance"] },
      process_flow: { steps: ["Signup", "Verification", "Login"].map((name) => ({ name })) },
      statement: { statement: "One clear sentence about the idea." },
    };
    for (const [template, cardPayload] of Object.entries(payloads)) {
      const card = normalizeCard({ ...base, cardTemplate: template, cardPayload });
      assert.equal(card.template, template);
      assert.equal(card.fallback, false, template);
    }
  });

  it("enforces template bounds (gallery needs 3-9 items, flow 3-6 steps, stage 1-3 screens)", () => {
    assert.equal(normalizeCard({ ...base, cardTemplate: "gallery_grid", cardPayload: { items: media(2) } }).fallback, true);
    assert.equal(normalizeCard({ ...base, cardTemplate: "gallery_grid", cardPayload: { items: media(10) } }).fallback, true);
    assert.equal(normalizeCard({ ...base, cardTemplate: "process_flow", cardPayload: { steps: [{ name: "a" }, { name: "b" }] } }).fallback, true);
    assert.equal(normalizeCard({ ...base, cardTemplate: "device_stage", cardPayload: { screens: media(4) } }).fallback, true);
  });

  it("requires alt text on every card image", () => {
    const cardPayload = { screens: [{ url: "https://res.cloudinary.com/x/a.png", alt: "" }] };
    assert.equal(normalizeCard({ ...base, cardTemplate: "device_stage", cardPayload }).fallback, true);
  });
});

describe("card editor helpers", () => {
  it("keeps facts and CTA when switching templates", () => {
    const next = cardSkeleton("statement", { facts: [{ label: "Role", value: "Designer" }], ctaLabel: "Read it", screens: media(2) });
    assert.deepEqual(next, { facts: [{ label: "Role", value: "Designer" }], ctaLabel: "Read it", statement: "" });
  });

  it("drops blank optional rows but keeps required slots so their errors show", () => {
    const cleaned = cleanCardPayload({
      ctaLabel: " ",
      facts: [{ label: "", value: "" }, { label: "Role", value: "Designer" }],
      targets: [{ value: "", caption: "" }],
      screens: [{ url: "", alt: "" }, media(1)[0]],
      steps: [{ name: "Signup", media: { url: "", alt: "" } }],
    });
    assert.deepEqual(cleaned, { facts: [{ label: "Role", value: "Designer" }], screens: [media(1)[0]], steps: [{ name: "Signup" }] });
  });

  it("produces a payload that validates once required slots are filled", () => {
    const raw = { ...cardSkeleton("device_stage"), screens: [...media(2), { url: "", alt: "" }], targets: [{ value: "", caption: "" }] };
    assert.equal(resolveCardInput({ cardTemplate: "device_stage", cardPayload: cleanCardPayload(raw) }).ok, true);
  });
});

describe("resolveCardInput for API writes (ADR-010 phase 3)", () => {
  it("leaves every card field unchanged when the client sends none", () => {
    assert.deepEqual(resolveCardInput({}), { ok: true, data: {} });
  });

  it("normalizes the colour to upper case and clears it with an empty string", () => {
    assert.deepEqual(resolveCardInput({ primaryColor: "#1872f5" }), { ok: true, data: { primaryColor: "#1872F5" } });
    assert.deepEqual(resolveCardInput({ primaryColor: "" }), { ok: true, data: { primaryColor: null } });
  });

  it("accepts a valid payload with its template and returns the parsed payload", () => {
    const result = resolveCardInput({ cardTemplate: "statement", cardPayload: { statement: "  One idea.  " }, collection: "brand" });
    assert.deepEqual(result, { ok: true, data: { cardTemplate: "statement", cardPayload: { statement: "One idea." }, collection: "brand" } });
  });

  it("clears the payload with null", () => {
    assert.deepEqual(resolveCardInput({ cardTemplate: "device_stage", cardPayload: null }), { ok: true, data: { cardTemplate: "device_stage", cardPayload: null } });
  });

  it("rejects a payload sent without a template", () => {
    const result = resolveCardInput({ cardPayload: { statement: "x" } });
    assert.equal(result.ok, false);
  });

  it("rejects an invalid payload with a message that names the field", () => {
    const result = resolveCardInput({ cardTemplate: "gallery_grid", cardPayload: { items: media(1) } });
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.error, /gallery_grid.*items/);
  });
});

describe("project validation accepts the new optional card fields", () => {
  const valid = { title: "GoFinancial", slug: "gofinancial", description: "An expense tracker for everyday spending.", category: "Fintech" };

  it("keeps existing project payloads valid with no card fields", () => {
    assert.equal(projectSchema.safeParse(valid).success, true);
  });

  it("accepts a hex colour, template, payload and collection", () => {
    const result = projectSchema.safeParse({ ...valid, primaryColor: "#1872F5", cardTemplate: "device_stage", cardPayload: { screens: [] }, collection: "brand" });
    assert.equal(result.success, true);
  });

  it("accepts an empty colour so the admin field can be cleared", () => {
    assert.equal(projectSchema.safeParse({ ...valid, primaryColor: "" }).success, true);
  });

  it("rejects a malformed colour, unknown template or unknown collection", () => {
    assert.equal(projectSchema.safeParse({ ...valid, primaryColor: "blue" }).success, false);
    assert.equal(projectSchema.safeParse({ ...valid, cardTemplate: "carousel" }).success, false);
    assert.equal(projectSchema.safeParse({ ...valid, collection: "archive" }).success, false);
  });
});
