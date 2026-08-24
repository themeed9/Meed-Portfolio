import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const renderer = readFileSync(new URL("../../components/projects/CaseStudySection.tsx", import.meta.url), "utf8");

describe("case-study media rendering regressions", () => {
  it("keeps evidence narrative rendering ahead of generic media rendering", () => {
    assert.ok(renderer.indexOf('section.type === "evidence"') < renderer.indexOf('"media" in payload'));
    assert.match(renderer, /<Structured payload=\{\{ finding: payload\.finding, evidence: payload\.evidence, implication: payload\.implication \}\}/);
    assert.match(renderer, /<MediaSet media=\{media\} preserveInterface \/>/);
  });
});
