import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}));

import { getFavorites } from "./favorites";
import { dominantTypeColor, FALLBACK_TYPE_COLOR } from "./collections";
import { FAVORITES_PER_SECTION } from "./limits";
import { prisma } from "@/lib/prisma";

const mockItemFindMany = vi.mocked(prisma.item.findMany);
const mockCollectionFindMany = vi.mocked(prisma.collection.findMany);

function collectionRow(
  overrides: Record<string, unknown> = {},
  typeColors: { id: string; color: string }[] = [],
) {
  return {
    id: "col-1",
    name: "React Patterns",
    updatedAt: new Date("2026-06-01"),
    items: typeColors.map((t) => ({ item: { itemType: t } })),
    ...overrides,
  };
}

describe("dominantTypeColor", () => {
  it("returns the color of the most frequent type", () => {
    const blue = { id: "t1", color: "#3b82f6" };
    const purple = { id: "t2", color: "#8b5cf6" };
    expect(dominantTypeColor([blue, purple, blue])).toBe("#3b82f6");
  });

  it("falls back to neutral gray for an empty list", () => {
    expect(dominantTypeColor([])).toBe(FALLBACK_TYPE_COLOR);
  });
});

describe("getFavorites (db)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockItemFindMany.mockResolvedValue([] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);
  });

  it("scopes both queries to the user, favorites only, bounded and newest-first", async () => {
    await getFavorites("user-1");

    expect(mockItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: true },
        orderBy: { updatedAt: "desc" },
        take: FAVORITES_PER_SECTION,
      }),
    );
    expect(mockCollectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: true },
        orderBy: { updatedAt: "desc" },
        take: FAVORITES_PER_SECTION,
      }),
    );
  });

  it("returns favorited items unchanged from the query", async () => {
    const item = { id: "i1", title: "Hello", isFavorite: true };
    mockItemFindMany.mockResolvedValue([item] as never);

    const { items } = await getFavorites("user-1");
    expect(items).toEqual([item]);
  });

  it("maps each collection to its dominant-type color", async () => {
    mockCollectionFindMany.mockResolvedValue([
      collectionRow({ id: "c1", name: "Mostly blue" }, [
        { id: "t1", color: "#3b82f6" },
        { id: "t1", color: "#3b82f6" },
        { id: "t2", color: "#8b5cf6" },
      ]),
    ] as never);

    const { collections } = await getFavorites("user-1");
    expect(collections[0]).toEqual({
      id: "c1",
      name: "Mostly blue",
      updatedAt: new Date("2026-06-01"),
      dominantColor: "#3b82f6",
    });
  });

  it("uses the neutral fallback color for empty collections", async () => {
    mockCollectionFindMany.mockResolvedValue([
      collectionRow({ id: "c-empty", name: "Empty" }, []),
    ] as never);

    const { collections } = await getFavorites("user-1");
    expect(collections[0].dominantColor).toBe(FALLBACK_TYPE_COLOR);
  });
});
