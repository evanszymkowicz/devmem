import { describe, it, expect } from "vitest";

import {
  defaultDirection,
  sortFavoriteItems,
  sortFavoriteCollections,
} from "./sort-favorites";
import type { ItemWithType } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/favorites";

// The sort helpers only read title/name, updatedAt, and itemType.name, so the
// fixtures provide just those fields (cast to the full type for convenience).
function item(
  id: string,
  title: string,
  updatedAt: string,
  typeName: string,
): ItemWithType {
  return {
    id,
    title,
    updatedAt: new Date(updatedAt),
    itemType: { name: typeName },
  } as unknown as ItemWithType;
}

function collection(
  id: string,
  name: string,
  updatedAt: string,
): FavoriteCollection {
  return { id, name, updatedAt: new Date(updatedAt), dominantColor: "#000" };
}

const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

describe("defaultDirection", () => {
  it("defaults dates to descending (newest first)", () => {
    expect(defaultDirection("date")).toBe("desc");
  });

  it("defaults name and type to ascending (A→Z)", () => {
    expect(defaultDirection("name")).toBe("asc");
    expect(defaultDirection("type")).toBe("asc");
  });
});

describe("sortFavoriteItems", () => {
  const items = [
    item("a", "Banana", "2026-01-01", "Snippet"),
    item("b", "apple", "2026-03-01", "Prompt"),
    item("c", "Cherry", "2026-02-01", "Command"),
  ];

  it("sorts by name case-insensitively, ascending", () => {
    const sorted = sortFavoriteItems(items, {
      field: "name",
      direction: "asc",
    });
    expect(ids(sorted)).toEqual(["b", "a", "c"]); // apple, Banana, Cherry
  });

  it("sorts by name descending", () => {
    const sorted = sortFavoriteItems(items, {
      field: "name",
      direction: "desc",
    });
    expect(ids(sorted)).toEqual(["c", "a", "b"]);
  });

  it("sorts by date, descending = newest first", () => {
    const sorted = sortFavoriteItems(items, {
      field: "date",
      direction: "desc",
    });
    expect(ids(sorted)).toEqual(["b", "c", "a"]);
  });

  it("sorts by date ascending = oldest first", () => {
    const sorted = sortFavoriteItems(items, {
      field: "date",
      direction: "asc",
    });
    expect(ids(sorted)).toEqual(["a", "c", "b"]);
  });

  it("sorts by item type name", () => {
    const sorted = sortFavoriteItems(items, {
      field: "type",
      direction: "asc",
    });
    // Command, Prompt, Snippet
    expect(ids(sorted)).toEqual(["c", "b", "a"]);
  });

  it("tie-breaks equal types by name", () => {
    const sameType = [
      item("a", "Zebra", "2026-01-01", "Snippet"),
      item("b", "Alpha", "2026-01-01", "Snippet"),
    ];
    const sorted = sortFavoriteItems(sameType, {
      field: "type",
      direction: "asc",
    });
    expect(ids(sorted)).toEqual(["b", "a"]); // Alpha before Zebra
  });

  it("does not mutate the input array", () => {
    const original = [...items];
    sortFavoriteItems(items, { field: "name", direction: "asc" });
    expect(ids(items)).toEqual(ids(original));
  });

  it("handles an empty array", () => {
    expect(sortFavoriteItems([], { field: "name", direction: "asc" })).toEqual(
      [],
    );
  });
});

describe("sortFavoriteCollections", () => {
  const collections = [
    collection("a", "Beta", "2026-01-01"),
    collection("b", "alpha", "2026-03-01"),
    collection("c", "Gamma", "2026-02-01"),
  ];

  it("sorts by name case-insensitively", () => {
    const sorted = sortFavoriteCollections(collections, {
      field: "name",
      direction: "asc",
    });
    expect(ids(sorted)).toEqual(["b", "a", "c"]); // alpha, Beta, Gamma
  });

  it("sorts by date descending", () => {
    const sorted = sortFavoriteCollections(collections, {
      field: "date",
      direction: "desc",
    });
    expect(ids(sorted)).toEqual(["b", "c", "a"]);
  });

  it("falls back to name ordering for the type field (collections have no type)", () => {
    const sorted = sortFavoriteCollections(collections, {
      field: "type",
      direction: "asc",
    });
    // All share the constant "Collection" label, so it tie-breaks by name.
    expect(ids(sorted)).toEqual(["b", "a", "c"]);
  });

  it("does not mutate the input array", () => {
    const original = [...collections];
    sortFavoriteCollections(collections, { field: "date", direction: "asc" });
    expect(ids(collections)).toEqual(ids(original));
  });
});
