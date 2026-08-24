import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSiteUrl } from "../../lib/seo.ts";

describe("canonical production origin", () => {
  it("prefers Vercel's stable production domain in production", () => {
    assert.equal(getSiteUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      VERCEL_PROJECT_PRODUCTION_URL: "meed-portfolio.vercel.app",
    }), "https://meed-portfolio.vercel.app");
  });

  it("keeps an explicit non-production site URL for local verification", () => {
    assert.equal(getSiteUrl({
      NODE_ENV: "test",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3100/",
      VERCEL_PROJECT_PRODUCTION_URL: undefined,
    }), "http://localhost:3100");
  });
});
