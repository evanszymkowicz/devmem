import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/validations/collections";

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

const MAX_DASHBOARD_COLLECTIONS = 6;
const MAX_COLLECTIONS = 200;
const MAX_COLLECTION_ITEMS = 200;

// Shared loader for the collection-card views (dashboard + /collections). Both
// need the same dominant-type computation; only the row limit differs.
async function getCollectionsWithTypes(
  userId: string,
  take: number,
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    take,
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

export function getDashboardCollections(
  userId: string,
): Promise<CollectionWithTypes[]> {
  return getCollectionsWithTypes(userId, MAX_DASHBOARD_COLLECTIONS);
}

export function getCollections(
  userId: string,
): Promise<CollectionWithTypes[]> {
  return getCollectionsWithTypes(userId, MAX_COLLECTIONS);
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  itemCount: number;
  dominantColor: string;
}

const MAX_SIDEBAR_COLLECTIONS = 50;

export async function getSidebarCollections(
  userId: string,
): Promise<SidebarCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    take: MAX_SIDEBAR_COLLECTIONS,
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

const collectionDetailInclude = {
  items: {
    orderBy: { addedAt: "desc" },
    take: MAX_COLLECTION_ITEMS,
    include: {
      item: {
        include: { itemType: true, tags: true },
      },
    },
  },
} satisfies Prisma.CollectionInclude;

export type CollectionDetailRow = Prisma.CollectionGetPayload<{
  include: typeof collectionDetailInclude;
}>;

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: CollectionDetailRow["items"][number]["item"][];
}

export async function getCollectionWithItems(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: collectionDetailInclude,
  });

  if (!collection) return null;

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    items: collection.items.map((ic) => ic.item),
  };
}

export async function createCollection(
  userId: string,
  data: CreateCollectionInput,
) {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
    },
  });
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: UpdateCollectionInput,
): Promise<boolean> {
  // updateMany scopes to userId so a non-owner can't update another user's row.
  const result = await prisma.collection.updateMany({
    where: { id: collectionId, userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description ?? null }
        : {}),
    },
  });
  return result.count > 0;
}

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  // deleteMany gives an atomic ownership check; join rows cascade, items stay.
  const result = await prisma.collection.deleteMany({
    where: { id: collectionId, userId },
  });
  return result.count > 0;
}
