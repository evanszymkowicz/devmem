import { prisma } from "@/lib/prisma";

export interface CollectionWithTypes {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  // Ordered: dominant type first (most items), then remaining types
  itemTypes: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  }[];
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export async function getDashboardCollections(
  userId: string,
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    // Count occurrences of each item type in this collection
    const typeCounts = new Map<string, { count: number; type: CollectionWithTypes["itemTypes"][number] }>();

    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, {
          count: 1,
          type: { id: t.id, name: t.name, slug: t.slug, icon: t.icon, color: t.color },
        });
      }
    }

    // Sort by count descending so dominant type is first
    const itemTypes = [...typeCounts.values()]
      .sort((a, b) => b.count - a.count)
      .map((v) => v.type);

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      itemTypes,
    };
  });
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
}

export async function getSidebarCollections(
  userId: string,
): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    include: {
      items: {
        include: {
          item: {
            include: { itemType: { select: { id: true, color: true } } },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<string, { count: number; color: string }>();
    for (const ic of col.items) {
      const t = ic.item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { count: 1, color: t.color });
      }
    }
    const dominant = [...typeCounts.values()].sort((a, b) => b.count - a.count)[0];
    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      // Empty collections have no items, so typeCounts is empty and dominant is
      // undefined; gray is the neutral fallback color.
      dominantColor: dominant?.color ?? "#6b7280",
    };
  });
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
