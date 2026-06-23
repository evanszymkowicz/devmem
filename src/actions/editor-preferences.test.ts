import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks are hoisted before imports, so the prisma startup guard never runs.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

import { updateEditorPreferences } from "./editor-preferences";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DEFAULT_EDITOR_PREFERENCES } from "@/lib/editor-preferences";

const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(prisma.user.update);

const AUTHED_SESSION = { user: { id: "user-1", email: "user@example.com" } };

const VALID_PREFS = {
  fontSize: 16,
  tabSize: 4,
  wordWrap: false,
  minimap: true,
  theme: "monokai" as const,
};

describe("updateEditorPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateEditorPreferences(VALID_PREFS);
    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("returns error on validation failure", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await updateEditorPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 99, // not an allowed option
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rejects an invalid theme", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await updateEditorPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      // @ts-expect-error testing runtime rejection of an unknown theme
      theme: "dracula",
    });
    expect(result.success).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("persists validated prefs scoped to the session user", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await updateEditorPreferences(VALID_PREFS);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: VALID_PREFS },
    });
  });

  it("returns a friendly error when the update throws", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockUpdate.mockRejectedValue(new Error("db down"));

    const result = await updateEditorPreferences(VALID_PREFS);

    expect(result).toEqual({
      success: false,
      error: "Failed to save preferences",
    });
  });
});
