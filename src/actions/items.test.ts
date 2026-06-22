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
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  getItemFileUrl: vi.fn(),
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
}));

import { createItem, updateItem } from "./items";
import { createItem as dbCreateItem, updateItem as dbUpdateItem } from "@/lib/db/items";
import { auth } from "@/auth";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateItem);
const mockDbUpdate = vi.mocked(dbUpdateItem);

const AUTHED_SESSION = { user: { id: "user-1" } };

const VALID_CREATE_PAYLOAD = {
  typeSlug: "snippets",
  title: "New Snippet",
  description: null,
  content: "console.log('hi')",
  language: "typescript",
  url: null,
  tags: ["ts"],
};

const MOCK_CREATED_ITEM = {
  id: "item-new",
  title: "New Snippet",
  itemType: { id: "type-1", name: "Snippet", slug: "snippets", icon: "Code", color: "#3b82f6", isSystem: true, userId: null },
  tags: [{ id: "tag-1", name: "ts" }],
  collections: [],
};

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

describe("createItem action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when there is no session", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItem(VALID_CREATE_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns a validation error when typeSlug is invalid", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await createItem({ ...VALID_CREATE_PAYLOAD, typeSlug: "custom-invalid" });
    expect(result.success).toBe(false);
  });

  it("returns a validation error when title is empty", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await createItem({ ...VALID_CREATE_PAYLOAD, title: "" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/title/i);
  });

  it("returns a validation error when link type is missing URL", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    const result = await createItem({ typeSlug: "links", title: "A Link", url: null, tags: [] });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/url/i);
  });

  it("returns item-type-not-found when the DB returns null", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbCreate.mockResolvedValue(null as never);
    const result = await createItem(VALID_CREATE_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Item type not found" });
  });

  it("returns success with created item on happy path", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbCreate.mockResolvedValue(MOCK_CREATED_ITEM as never);
    const result = await createItem(VALID_CREATE_PAYLOAD);
    expect(result).toEqual({ success: true, data: MOCK_CREATED_ITEM });
  });

  it("passes the correct userId to the DB query", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbCreate.mockResolvedValue(MOCK_CREATED_ITEM as never);
    await createItem(VALID_CREATE_PAYLOAD);
    expect(mockDbCreate).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ typeSlug: "snippets", title: "New Snippet" }),
    );
  });

  it("returns a generic error when the DB throws", async () => {
    mockAuth.mockResolvedValue(AUTHED_SESSION as never);
    mockDbCreate.mockRejectedValue(new Error("db error"));
    const result = await createItem(VALID_CREATE_PAYLOAD);
    expect(result).toEqual({ success: false, error: "Failed to create item" });
  });
});
