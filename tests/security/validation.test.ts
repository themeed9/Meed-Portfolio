import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contactFormSchema, loginSchema } from "../../lib/validations.ts";

describe("contact validation bounds (SEC-INV-007)", () => {
  const valid = {
    name: "A Visitor",
    email: "visitor@example.com",
    message: "This is a genuinely useful inquiry message.",
  };

  it("accepts a well-formed contact message", () => {
    assert.equal(contactFormSchema.safeParse(valid).success, true);
  });

  it("rejects a filled honeypot website field", () => {
    const result = contactFormSchema.safeParse({ ...valid, website: "http://spam.example" });
    assert.equal(result.success, false);
  });

  it("rejects a message shorter than 10 characters", () => {
    assert.equal(contactFormSchema.safeParse({ ...valid, message: "too short" }).success, false);
  });

  it("rejects a message longer than 5000 characters", () => {
    assert.equal(contactFormSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success, false);
  });

  it("rejects an invalid email", () => {
    assert.equal(contactFormSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
  });

  it("rejects an over-long name", () => {
    assert.equal(contactFormSchema.safeParse({ ...valid, name: "n".repeat(101) }).success, false);
  });

  it("trims name and email", () => {
    const result = contactFormSchema.safeParse({
      ...valid,
      name: "  Padded Name  ",
      email: "  visitor@example.com  ",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.name, "Padded Name");
      assert.equal(result.data.email, "visitor@example.com");
    }
  });
});

describe("login validation", () => {
  it("rejects an empty password", () => {
    assert.equal(loginSchema.safeParse({ email: "admin@example.com", password: "" }).success, false);
  });

  it("rejects an invalid email format", () => {
    assert.equal(loginSchema.safeParse({ email: "nope", password: "secret" }).success, false);
  });

  it("accepts a well-formed login", () => {
    assert.equal(
      loginSchema.safeParse({ email: "admin@example.invalid", password: "correct-horse" }).success,
      true,
    );
  });
});
