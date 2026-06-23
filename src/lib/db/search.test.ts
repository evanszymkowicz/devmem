import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}));

import { getSearchData } from "./search";
import { prisma } from "@/lib/prisma";

const mockItemFindMany = vi.mocked(prisma.item.findMany);
const mockCollectionFindMany = vi.mocked(prisma.collection.findMany);

const TYPE = { name: "Snippet", icon: "Code", color: "#3b82f6" };

function itemRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-1",
    title: "My Item",
    content: null,
    description: null,
    url: null,
    itemType: TYPE,
    ...overrides,
  };
}

describe("getSearchData (db)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockItemFindMany.mockResolvedValue([] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);
  });

  it("scopes both queries to the given userId with bounded takes", async () => {
    await getSearchData("user-1");

    expect(mockItemFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, take: 500 }),
    );
    expect(mockCollectionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" }, take: 200 }),
    );
  });

  it("maps item type fields and collection counts onto the result shape", async () => {
    mockItemFindMany.mockResolvedValue([
      itemRow({ id: "i1", title: "Hello", description: "A description" }),
    ] as never);
    mockCollectionFindMany.mockResolvedValue([
      { id: "c1", name: "React Patterns", _count: { items: 3 } },
    ] as never);

    const data = await getSearchData("user-1");

    expect(data.items[0]).toEqual({
      id: "i1",
      title: "Hello",
      preview: "A description",
      typeName: "Snippet",
      typeIcon: "Code",
      typeColor: "#3b82f6",
    });
    expect(data.collections[0]).toEqual({
      id: "c1",
      name: "React Patterns",
      itemCount: 3,
    });
  });

  it("prefers description, then content, then url for the preview", async () => {
    mockItemFindMany.mockResolvedValue([
      itemRow({ id: "desc", description: "desc text", content: "content text", url: "https://a.com" }),
      itemRow({ id: "content", content: "content text", url: "https://a.com" }),
      itemRow({ id: "url", url: "https://a.com" }),
    ] as never);

    const data = await getSearchData("user-1");
    const previews = Object.fromEntries(data.items.map((i) => [i.id, i.preview]));

    expect(previews.desc).toBe("desc text");
    expect(previews.content).toBe("content text");
    expect(previews.url).toBe("https://a.com");
  });

  it("skips blank/whitespace-only candidates when choosing the preview", async () => {
    mockItemFindMany.mockResolvedValue([
      itemRow({ description: "   ", content: "real content" }),
    ] as never);

    const data = await getSearchData("user-1");
    expect(data.items[0].preview).toBe("real content");
  });

  it("collapses internal whitespace and newlines into single spaces", async () => {
    mockItemFindMany.mockResolvedValue([
      itemRow({ content: "line one\n\n   line   two\ttabbed" }),
    ] as never);

    const data = await getSearchData("user-1");
    expect(data.items[0].preview).toBe("line one line two tabbed");
  });

  it("truncates long previews to 120 chars with an ellipsis", async () => {
    const long = "x".repeat(200);
    mockItemFindMany.mockResolvedValue([itemRow({ content: long })] as never);

    const data = await getSearchData("user-1");
    const preview = data.items[0].preview;
    expect(preview).toBe(`${"x".repeat(120)}…`);
    expect(preview).toHaveLength(121); // 120 chars + ellipsis
  });

  it("returns an empty preview when no text candidate is present", async () => {
    mockItemFindMany.mockResolvedValue([itemRow()] as never);

    const data = await getSearchData("user-1");
    expect(data.items[0].preview).toBe("");
  });
});
