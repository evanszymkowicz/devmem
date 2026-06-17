import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findFirst: vi.fn(), update: vi.fn() },
    tag: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
}));

import { updateItem } from "./items";
import { updateItem as dbUpdateItem } from "@/lib/db/items";
import { auth } from "@/auth";

const mockAuth = vi.mocked(auth);
const mockDbUpdate = vi.mocked(dbUpdateItem);

const AUTHED_SESSION = { user: { id: "user-1" } };

const VALID_PAYLOAD = {
  title: "My Snippet",
  description: "A description",
  content: "console.log('hello')",
  language: "typescript",
  url: null,
  tags: ["ts", "node"],
};

const MOCK_ITEM_DETAIL = {
  id: "item-1",
  title: "My Snippet",
  itemType: { id: "type-1", name: "Snippet", slug: "snippets", icon: "Code", color: "#3b82f6", isSystem: true, userId: null },
  tags: [{ id: "tag-1", name: "ts" }],
  collections: [],
};

describe("updateItem action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateItem("item-1", VALID_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("returns a validation error when title is empty", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await updateItem("item-1", { ...VALID_PAYLOAD, title: "" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/title/i);
  });

  it("returns a validation error for an invalid URL", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await updateItem("item-1", { ...VALID_PAYLOAD, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("returns item-not-found when the DB query returns null", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbUpdate.mockResolvedValue(null as never);
    const result = await updateItem("item-1", VALID_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns success with updated item data on happy path", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbUpdate.mockResolvedValue(MOCK_ITEM_DETAIL as never);
    const result = await updateItem("item-1", VALID_PAYLOAD);
    expect(result).toEqual({ success: true, data: MOCK_ITEM_DETAIL });
  });

  it("passes the correct userId and itemId to the DB query", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbUpdate.mockResolvedValue(MOCK_ITEM_DETAIL as never);
    await updateItem("item-abc", VALID_PAYLOAD);
    expect(mockDbUpdate).toHaveBeenCalledWith(
      "user-1",
      "item-abc",
      expect.objectContaining({ title: "My Snippet", tags: ["ts", "node"] }),
    );
  });

  it("returns a generic error when the DB throws", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbUpdate.mockRejectedValue(new Error("connection lost"));
    const result = await updateItem("item-1", VALID_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Failed to save changes" });
  });
});
