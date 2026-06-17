import { describe, it, expect } from "vitest";
import {
  registerSchema,
  signInSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth";

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    const result = signInSchema.safeParse({ email: "user@example.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = signInSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Alice",
    email: "alice@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  it("accepts valid registration input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("confirmPassword");
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than 72 characters", () => {
    const long = "a".repeat(73);
    const result = registerSchema.safeParse({ ...valid, password: long, confirmPassword: long });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse({ ...valid, name: "  " });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const validToken = "a".repeat(64);
  const valid = { token: validToken, password: "newpassword1", confirmPassword: "newpassword1" };

  it("accepts a valid reset payload", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a token that is not 64 hex characters", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, token: "tooshort" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: "other" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "oldpassword1",
    newPassword: "newpassword1",
    confirmPassword: "newpassword1",
  };

  it("accepts valid change-password input", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("confirmPassword");
  });

  it("rejects an empty current password", () => {
    const result = changePasswordSchema.safeParse({ ...valid, currentPassword: "" });
    expect(result.success).toBe(false);
  });
});
