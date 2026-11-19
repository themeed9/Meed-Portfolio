import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { caseStudySectionTypes, payloadSchemaFor } from "../../lib/case-study.ts";
import {
  TYPE_INFO, caseStudyTemplates, checkBlock, cleanBlockMedia, cleanPayload, contentsEntries, convertedLegacyFields,
  emptyPayload, legacyBlocks, readBlockSettings, readingMinutes, type FieldSpec,
} from "../../lib/case-study-blocks.ts";

const img = { url: "https://res.cloudinary.com/demo/image/upload/v1/screen.png", alt: "Checkout screen" };

// Fill a blank payload the way an editor would, from the field specs alone.
function filled(fields: FieldSpec[]): Record<string, unknown> {
  return Object.fromEntries(fields.map((field) => {
    if (field.kind === "text" || field.kind === "textarea") return [field.key, `${field.label} text`];
    if (field.kind === "media") return [field.key, img];
    if (field.kind === "mediaList") return [field.key, [img, img]];
    if (field.kind === "strings") return [field.key, ["One", "Two"]];
    return [field.key, [0, 1].map(() => Object.fromEntries(field.fields.map((sub) => [sub.key, `${sub.label} text`])))];
  }));
}

describe("case-study block field specs (ADR-011)", () => {
  it("has a label, description and field spec for every block type", () => {
    for (const type of caseStudySectionTypes) {
      assert.ok(TYPE_INFO[type].label && TYPE_INFO[type].description, type);
    }
  });

  it("produces a valid payload for every type once its fields are filled in", () => {
    for (const type of caseStudySectionTypes) {
      if (type === "rich_text") continue;
      const payload = cleanPayload(type, filled(TYPE_INFO[type].fields));
      const result = payloadSchemaFor(type).safeParse(payload);
      assert.ok(result.success, `${type}: ${result.success ? "" : result.error.issues[0].message}`);
    }
  });

  it("covers every required key of each payload schema", () => {
    for (const type of caseStudySectionTypes) {
      if (type === "rich_text") continue;
      const blank = emptyPayload(type);
      for (const field of TYPE_INFO[type].fields) assert.ok(field.key in blank, `${type}.${field.key}`);
    }
  });

  it("keeps shared values when the block type changes", () => {
    const next = emptyPayload("outcome", { result: "", evidence: "Survey of 40 users", unrelated: "x" });
    assert.equal(next.evidence, "Survey of 40 users");
    assert.equal("unrelated" in next, false);
  });

  it("drops blank optional text, empty rows and empty media, and trims the rest", () => {
    const payload = cleanPayload("evidence", { finding: "  Users skip onboarding ", evidence: "Analytics", implication: "  ", media: [{ url: "", alt: "" }, { ...img, caption: " " }] });
    assert.deepEqual(payload, { finding: "Users skip onboarding", evidence: "Analytics", media: [img] });
    assert.deepEqual(cleanPayload("timeline", { events: [{ period: "", title: "", detail: "" }] }), { events: [] });
    assert.deepEqual(cleanBlockMedia([{ url: "", alt: "" }, img]), [img]);
  });
});

describe("block checks before saving (ADR-011)", () => {
  it("requires the typed fields of a public block, naming the block", () => {
    const result = checkBlock("decision", { context: "x" }, { hidden: false });
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.error, /Design decision/);
  });

  it("rejects a public block whose required fields are blank, even though the schema allows empty text", () => {
    const result = checkBlock("decision", emptyPayload("decision"), { hidden: false });
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.error, /“Context”/);
    assert.equal(checkBlock("gallery", { media: [{ url: img.url, alt: " " }] }, null).ok, false);
    assert.equal(checkBlock("tradeoff", { options: [{ label: "A", benefit: "b", cost: "c" }], decision: "A" }, null).ok, false);
  });

  it("accepts an incomplete block as a hidden draft", () => {
    assert.equal(checkBlock("decision", emptyPayload("decision"), { hidden: true }).ok, true);
  });

  it("accepts a text block with or without media", () => {
    assert.equal(checkBlock("rich_text", null, null).ok, true);
    assert.equal(checkBlock("rich_text", null, { media: [img], mediaLayout: "right" }).ok, true);
  });

  it("requires alt text on every block image, even in drafts", () => {
    const result = checkBlock("rich_text", null, { hidden: true, media: [{ url: img.url, alt: "" }] });
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.error, /^Image 1: .*alt text/);
  });

  it("rejects unknown layout, width or background values", () => {
    assert.equal(checkBlock("rich_text", null, { mediaLayout: "diagonal" }).ok, false);
    assert.equal(checkBlock("rich_text", null, { width: "huge" }).ok, false);
    assert.equal(checkBlock("rich_text", null, { background: "#f00" }).ok, false);
  });
});

describe("reading block settings for the page", () => {
  it("defaults to text-only, visible, plain, below", () => {
    assert.deepEqual(readBlockSettings(undefined), { media: [], mediaLayout: "below", width: "default", background: "plain", hidden: false, showInContents: true });
  });

  it("turns the legacy single image into the first media item", () => {
    assert.deepEqual(readBlockSettings(null, { url: img.url, alt: "Old" }).media, [{ url: img.url, alt: "Old" }]);
    assert.deepEqual(readBlockSettings({ media: [img] }, { url: "/other.png", alt: "Old" }).media, [img]);
  });

  it("keeps valid settings and drops only the broken ones", () => {
    const settings = readBlockSettings({ hidden: true, width: "huge", media: [img, { url: "javascript:alert(1)", alt: "x" }] });
    assert.equal(settings.hidden, true);
    assert.equal(settings.width, "default");
    assert.deepEqual(settings.media, [img]);
  });
});

describe("templates and legacy conversion", () => {
  it("creates every template block as a valid hidden draft", () => {
    for (const template of Object.values(caseStudyTemplates)) {
      for (const block of template.blocks) {
        assert.equal(block.metadata.hidden, true);
        assert.equal(checkBlock(block.type, block.payload, block.metadata).ok, true, `${template.label}: ${block.type}`);
      }
    }
  });

  it("keeps public legacy text visible and hides text that was never public", () => {
    const blocks = legacyBlocks({ overview: "Context", challenge: "Tension", approach: "Steps", results: "  ", testimonial: "Great", testimonialAuthor: "A. Client" }, []);
    assert.deepEqual(blocks.map((b) => [b.metadata.legacy, b.metadata.hidden]), [["overview", false], ["challenge", false], ["approach", true], ["testimonial", true]]);
    assert.equal(blocks[0].title, "The product in context.");
    assert.match(blocks[3].content, /— A\. Client$/);
  });

  it("never converts the same field twice", () => {
    const converted = convertedLegacyFields([{ metadata: { legacy: "overview" } }, { metadata: null }, { metadata: { legacy: "nonsense" } }]);
    assert.deepEqual(converted, ["overview"]);
    assert.deepEqual(legacyBlocks({ overview: "Context" }, converted), []);
  });
});

describe("page extras", () => {
  it("lists visible titled blocks in “On this page”", () => {
    const entries = contentsEntries([
      { id: "a", title: "The problem.", metadata: null },
      { id: "b", title: "Draft", metadata: { hidden: true } },
      { id: "c", title: "Not listed", metadata: { showInContents: false } },
      { id: "d", title: null, metadata: null },
    ]);
    assert.deepEqual(entries, [{ id: "section-a", label: "The problem" }]);
  });

  it("estimates reading time from text, never below a minute", () => {
    assert.equal(readingMinutes(["short"]), 1);
    assert.equal(readingMinutes([Array(1100).fill("word").join(" ")]), 5);
    assert.equal(readingMinutes([{ url: "https://x/very-long-url", body: "two words" }]), 1);
  });
});
