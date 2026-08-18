import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeSection } from "../../lib/case-study.ts";

describe("typed case-study section normalization (ADR-003 content integrity)", () => {
  const base = { id: "s1", title: null, content: "", order: 0 };

  it("falls back to rich_text for an unknown section type", () => {
    const section = normalizeSection({ ...base, type: "not_a_real_type" });
    assert.equal(section.type, "rich_text");
    assert.deepEqual(section.payload, { body: "" });
  });

  it("keeps rich_text payload from legacy content", () => {
    const section = normalizeSection({ ...base, type: "rich_text", content: "legacy prose" });
    assert.equal(section.type, "rich_text");
    assert.deepEqual(section.payload, { body: "legacy prose" });
  });

  it("validates a typed payload against its schema", () => {
    const section = normalizeSection({
      ...base,
      type: "project_tldr",
      payload: { problem: "p", hypothesis: "h", role: "r", platform: "web", status: "shipped", contribution: "c" },
    });
    assert.equal(section.type, "project_tldr");
    assert.equal(section.payloadValid, true);
  });

  it("rejects an invalid typed payload without throwing", () => {
    const section = normalizeSection({ ...base, type: "project_tldr", payload: { problem: 42 } });
    assert.equal(section.payloadValid, false);
    assert.equal(section.payload, null);
  });

  it("normalizes a null type to rich_text", () => {
    const section = normalizeSection({ ...base, type: null });
    assert.equal(section.type, "rich_text");
    assert.equal(section.payloadValid, true);
  });
});
