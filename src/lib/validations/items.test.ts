import { describe, it, expect } from "vitest";
import { createItemSchema, updateItemSchema } from "./items";

describe("updateItemSchema", () => {
  const base = {
    title: "My Item",
    tags: [],
  };

  it("accepts a minimal valid payload", () => {
    const result = updateItemSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = updateItemSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = updateItemSchema.safeParse({ ...base, title: "   " });
    expect(result.success).toBe(false);
  });

  it("trims the title", () => {
    const result = updateItemSchema.safeParse({ ...base, title: "  Hello  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Hello");
  });

  it("accepts null description", () => {
    const result = updateItemSchema.safeParse({ ...base, description: null });
    expect(result.success).toBe(true);
  });

  it("accepts null url", () => {
    const result = updateItemSchema.safeParse({ ...base, url: null });
    expect(result.success).toBe(true);
  });

  it("converts empty string url to null", () => {
    const result = updateItemSchema.safeParse({ ...base, url: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.url).toBeNull();
  });

  it("accepts a valid url", () => {
    const result = updateItemSchema.safeParse({ ...base, url: "https://example.com" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.url).toBe("https://example.com");
  });

  it("rejects an invalid url string", () => {
    const result = updateItemSchema.safeParse({ ...base, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("defaults tags to an empty array when omitted", () => {
    const result = updateItemSchema.safeParse({ title: "Item" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it("accepts a non-empty tags array", () => {
    const result = updateItemSchema.safeParse({ ...base, tags: ["react", "hooks"] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual(["react", "hooks"]);
  });
});

describe("createItemSchema", () => {
  const baseSnippet = {
    typeSlug: "snippets",
    title: "My Snippet",
    tags: [],
  };

  const baseLink = {
    typeSlug: "links",
    title: "My Link",
    url: "https://example.com",
    tags: [],
  };

  it("accepts a minimal snippet payload", () => {
    const result = createItemSchema.safeParse(baseSnippet);
    expect(result.success).toBe(true);
  });

  it("accepts a valid link payload with URL", () => {
    const result = createItemSchema.safeParse(baseLink);
    expect(result.success).toBe(true);
  });

  it("rejects a missing typeSlug", () => {
    const { typeSlug: _, ...rest } = baseSnippet;
    const result = createItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a typeSlug not in the allowed list", () => {
    const result = createItemSchema.safeParse({ ...baseSnippet, typeSlug: "files" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty title", () => {
    const result = createItemSchema.safeParse({ ...baseSnippet, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = createItemSchema.safeParse({ ...baseSnippet, title: "   " });
    expect(result.success).toBe(false);
  });

  it("requires URL for link type", () => {
    const result = createItemSchema.safeParse({ ...baseLink, url: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("url");
    }
  });

  it("rejects an invalid URL string for link type", () => {
    const result = createItemSchema.safeParse({ ...baseLink, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("does not require URL for non-link types", () => {
    const result = createItemSchema.safeParse({ ...baseSnippet, url: null });
    expect(result.success).toBe(true);
  });

  it("defaults tags to an empty array when omitted", () => {
    const result = createItemSchema.safeParse({ typeSlug: "notes", title: "Note" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });
});
