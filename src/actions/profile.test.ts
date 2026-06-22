import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks are hoisted before imports, so the prisma startup guard never runs.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    item: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

import { changePassword, deleteAccount } from "./profile";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockUpdate = vi.mocked(prisma.user.update);
const mockDelete = vi.mocked(prisma.user.delete);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockHashPassword = vi.mocked(hashPassword);

const AUTHED_SESSION = { user: { id: "user-1", email: "user@example.com" } };

describe("changePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await changePassword({
      currentPassword: "old",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    });
    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns error on validation failure", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await changePassword({
      currentPassword: "",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("returns error when account has no password", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockFindUnique.mockResolvedValue({ password: null } as never);
    const result = await changePassword({
      currentPassword: "currentpassword1",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    });
    expect(result).toEqual({ success: false, error: "No password set on this account" });
  });

  it("returns error when current password is wrong", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockFindUnique.mockResolvedValue({ password: "hashed" } as never);
    mockVerifyPassword.mockResolvedValue(false);
    const result = await changePassword({
      currentPassword: "wrongpassword",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    });
    expect(result).toEqual({ success: false, error: "Current password is incorrect" });
  });

  it("updates the password on success", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockFindUnique.mockResolvedValue({ password: "hashed" } as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockHashPassword.mockResolvedValue("new-hashed");
    mockUpdate.mockResolvedValue({} as never);

    const result = await changePassword({
      currentPassword: "currentpassword1",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1",
    });

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "new-hashed" },
    });
  });
});

describe("deleteAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteAccount();
    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("deletes the account for the session user", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    vi.mocked(prisma.item.findMany).mockResolvedValue([] as never);
    mockDelete.mockResolvedValue({} as never);

    const result = await deleteAccount();

    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });
});
