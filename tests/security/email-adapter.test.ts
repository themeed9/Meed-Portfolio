import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { sendContactNotification } from "../../lib/email.ts";

const RESEND_API_URL = "https://api.resend.com/emails";

const sample = {
  name: "Ada Lovelace",
  email: "ada@example.invalid",
  subject: "Hello",
  message: "Your portfolio looks great.",
  recipientEmail: "me@example.com",
};

function okResponse() {
  return { ok: true, status: 200, json: async () => ({ id: "evt_test" }) } as Response;
}

function errorResponse(status: number) {
  return { ok: false, status } as Response;
}

beforeEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
});

afterEach(() => {
  delete process.env.RESEND_API_KEY;
  delete process.env.CONTACT_FROM_EMAIL;
});

describe("contact email adapter (SEC-INV-007 support)", () => {
  it("no-ops and never calls fetch when RESEND_API_KEY is unset", async () => {
    let called = false;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      called = true;
      return okResponse();
    }) as typeof fetch;

    try {
      await sendContactNotification(sample);
      assert.equal(called, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("POSTs a Resend payload with Bearer auth and correct fields", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_FROM_EMAIL = "Meed Portfolio <me@example.com>";
    const recorded: { url?: string; init?: RequestInit } = {};
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      recorded.url = String(url);
      recorded.init = init ?? {};
      return okResponse();
    }) as typeof fetch;

    try {
      await sendContactNotification(sample);

      assert.ok(recorded.url);
      assert.equal(recorded.url, RESEND_API_URL);

      const init = recorded.init;
      assert.ok(init);
      assert.equal(init.method, "POST");

      const headers = init.headers as Record<string, string>;
      assert.equal(headers.Authorization, "Bearer re_test_key");
      assert.equal(headers["Content-Type"], "application/json");

      const rawBody = init.body;
      assert.ok(rawBody);
      const body = JSON.parse(String(rawBody));
      assert.equal(body.from, "Meed Portfolio <me@example.com>");
      assert.equal(body.to, "me@example.com");
      assert.equal(body.subject, "Portfolio Contact: Hello from Ada Lovelace");
      assert.match(body.html, /Ada Lovelace/);
      assert.match(body.html, /Your portfolio looks great\./);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("falls back to the default Resend sender when CONTACT_FROM_EMAIL is unset", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    let capturedBody = "";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedBody = String(init?.body ?? "");
      return okResponse();
    }) as typeof fetch;

    try {
      await sendContactNotification(sample);
      const body = JSON.parse(capturedBody);
      assert.equal(body.from, "Meed Portfolio <onboarding@resend.dev>");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("throws a sanitized error (status only) on a non-2xx response", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => errorResponse(429)) as typeof fetch;

    try {
      await assert.rejects(
        sendContactNotification(sample),
        /Failed to send email notification: 429/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});