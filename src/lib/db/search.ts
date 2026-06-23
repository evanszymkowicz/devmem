import { prisma } from "@/lib/prisma";

export interface SearchItem {
  id: string;
  title: string;
  preview: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
}

export interface SearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

export interface SearchData {
  items: SearchItem[];
  collections: SearchCollection[];
}

// Bound the palette payload so a single fetch can't pull unbounded rows. Search
// is client-side fuzzy matching over this set, so these caps also cap memory.
const MAX_SEARCH_ITEMS = 500;
const MAX_SEARCH_COLLECTIONS = 200;
const PREVIEW_LENGTH = 120;

// Collapses whitespace/newlines and truncates so multi-line content/markdown
// renders as a single clean preview line in the command palette.
function toPreview(...candidates: (string | null)[]): string {
  const source = candidates.find((c) => c && c.trim().length > 0) ?? "";
  const normalized = source.replace(/\s+/g, " ").trim();
  return normalized.length > PREVIEW_LENGTH
    ? `${normalized.slice(0, PREVIEW_LENGTH)}…`
    : normalized;
}

export async function getSearchData(userId: string): Promise<SearchData> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: MAX_SEARCH_ITEMS,
      select: {
        id: true,
        title: true,
        content: true,
        description: true,
        url: true,
        itemType: { select: { name: true, icon: true, color: true } },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      take: MAX_SEARCH_COLLECTIONS,
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      preview: toPreview(item.description, item.content, item.url),
      typeName: item.itemType.name,
      typeIcon: item.itemType.icon,
      typeColor: item.itemType.color,
    })),
    collections: collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  };
}
