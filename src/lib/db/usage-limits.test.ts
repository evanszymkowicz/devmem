import { describe, it, expect, vi, beforeEach } from "vitest";
import { isItemLimitReached, isCollectionLimitReached, getUserUsage } from "./usage-limits";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

describe("isItemLimitReached", () => {
  it("returns false for Pro users regardless of count", () => {
    expect(isItemLimitReached(999, true)).toBe(false);
  });
  it("returns false when under the limit", () => {
    expect(isItemLimitReached(49, false)).toBe(false);
  });
  it("returns true at the limit", () => {
    expect(isItemLimitReached(50, false)).toBe(true);
  });
  it("returns true over the limit", () => {
    expect(isItemLimitReached(51, false)).toBe(true);
  });
});

describe("isCollectionLimitReached", () => {
  it("returns false for Pro users regardless of count", () => {
    expect(isCollectionLimitReached(999, true)).toBe(false);
  });
  it("returns false when under the limit", () => {
    expect(isCollectionLimitReached(2, false)).toBe(false);
  });
  it("returns true at the limit", () => {
    expect(isCollectionLimitReached(3, false)).toBe(true);
  });
  it("returns true over the limit", () => {
    expect(isCollectionLimitReached(4, false)).toBe(true);
  });
});

describe("getUserUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns correct counts and canCreate booleans", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(10);
    vi.mocked(prisma.collection.count).mockResolvedValue(1);
    const result = await getUserUsage("user-1", false);
    expect(result).toEqual({
      itemCount: 10,
      collectionCount: 1,
      canCreateItem: true,
      canCreateCollection: true,
    });
  });

  it("sets canCreateItem: false at exactly 50 items", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(50);
    vi.mocked(prisma.collection.count).mockResolvedValue(0);
    const result = await getUserUsage("user-1", false);
    expect(result.canCreateItem).toBe(false);
  });

  it("sets canCreateCollection: false at exactly 3 collections", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(0);
    vi.mocked(prisma.collection.count).mockResolvedValue(3);
    const result = await getUserUsage("user-1", false);
    expect(result.canCreateCollection).toBe(false);
  });

  it("bypasses all limits for Pro users without querying DB", async () => {
    const result = await getUserUsage("user-1", true);
    expect(result.canCreateItem).toBe(true);
    expect(result.canCreateCollection).toBe(true);
    expect(prisma.item.count).not.toHaveBeenCalled();
    expect(prisma.collection.count).not.toHaveBeenCalled();
  });
});
