import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginFailures,
} from "../../lib/rate-limit.ts";

describe("login rate limiting (SEC-INV-004 support)", () => {
  it("allows logins until five failures within the window", () => {
    const now = 1_000_000;
    for (let i = 0; i < 4; i++) {
      recordLoginFailure("key-basic", now + i * 1000);
      assert.equal(checkLoginRateLimit("key-basic", now + i * 1000).allowed, true);
    }
    recordLoginFailure("key-basic", now + 4000);
    assert.equal(checkLoginRateLimit("key-basic", now + 4000).allowed, false);
  });

  it("reports a retry-after while blocked and releases after cooldown", () => {
    const start = 2_000_000;
    for (let i = 0; i < 5; i++) recordLoginFailure("key-cooldown", start + i * 1000);

    const blocked = checkLoginRateLimit("key-cooldown", start + 5000);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSeconds > 0);

    const later = start + 5 * 1000 + 15 * 60 * 1000 + 1000;
    assert.equal(checkLoginRateLimit("key-cooldown", later).allowed, true);
  });

  it("clears recorded failures on success", () => {
    const now = 3_000_000;
    for (let i = 0; i < 4; i++) recordLoginFailure("key-clear", now + i * 1000);
    clearLoginFailures("key-clear");
    assert.equal(checkLoginRateLimit("key-clear", now + 10_000).allowed, true);
  });

  it("expires the failure window", () => {
    const now = 4_000_000;
    recordLoginFailure("key-expire", now);
    recordLoginFailure("key-expire", now + 16 * 60 * 1000);
    assert.equal(checkLoginRateLimit("key-expire", now + 16 * 60 * 1000 + 1).allowed, true);
  });
});

describe("contact rate limiting (SEC-INV-007 support)", () => {
  it("allows five submissions per window and rejects the sixth", () => {
    const now = 5_000_000;
    for (let i = 0; i < 5; i++) {
      assert.equal(checkRateLimit("contact:ip-a", 5, 15 * 60 * 1000, now + i * 1000).allowed, true);
    }
    const sixth = checkRateLimit("contact:ip-a", 5, 15 * 60 * 1000, now + 5000);
    assert.equal(sixth.allowed, false);
    assert.ok(sixth.retryAfterSeconds > 0);
  });

  it("rejects a duplicate submission within the suppression window", () => {
    const now = 6_000_000;
    assert.equal(checkRateLimit("contact-dup:f1", 1, 60 * 1000, now).allowed, true);
    assert.equal(checkRateLimit("contact-dup:f1", 1, 60 * 1000, now + 1000).allowed, false);
    assert.equal(checkRateLimit("contact-dup:f1", 1, 60 * 1000, now + 61 * 1000).allowed, true);
  });
});
