import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  COLLECTIONS_PER_PAGE,
  DASHBOARD_COLLECTIONS_LIMIT,
  ITEMS_PER_PAGE,
} from "@/lib/db/limits";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/validations/collections";

// Neutral gray fallback for collections with no items (no dominant type).
export const FALLBACK_TYPE_COLOR = "#6b7280";

// Given a collection's item types (with repeats), returns the color of the
// most frequent type. Empty collections fall back to neutral gray.
export function dominantTypeColor(
  types: { id: string; color: string }[],
): string {
  const counts = new Map<string, { count: number; color: string }>();
  for (const t of types) {
    const existing = counts.get(t.id);
    if (existing) existing.count++;
    else counts.set(t.id, { count: 1, color: t.color });
  }
  const dominant = [...counts.values()].sort((a, b) => b.count - a.count)[0];
  return dominant?.color ?? FALLBACK_TYPE_COLOR;
}

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

// Shared loader for the collection-card views (dashboard + /collections). Both
// need the same dominant-type computation; only the row window differs.
async function getCollectionsWithTypes(
  userId: string,
  take: number,
  skip = 0,
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
    take,
    skip,
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
  return getCollectionsWithTypes(userId, DASHBOARD_COLLECTIONS_LIMIT);
}

export interface PaginatedCollections {
  collections: CollectionWithTypes[];
  totalCount: number;
}

export async function getCollections(
  userId: string,
  page = 1,
): Promise<PaginatedCollections> {
  const [collections, totalCount] = await Promise.all([
    getCollectionsWithTypes(
      userId,
      COLLECTIONS_PER_PAGE,
      (page - 1) * COLLECTIONS_PER_PAGE,
    ),
    prisma.collection.count({ where: { userId } }),
  ]);

  return { collections, totalCount };
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

  return collections.map((col) => ({
    id: col.id,
    name: col.name,
    isFavorite: col.isFavorite,
    itemCount: col.items.length,
    dominantColor: dominantTypeColor(col.items.map((ic) => ic.item.itemType)),
  }));
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

// A single page of a collection's items, plus the collection's total item
// count (via _count) so the detail page can render numbered pagination.
function collectionDetailInclude(page: number) {
  return {
    items: {
      orderBy: { addedAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
      include: {
        item: {
          include: { itemType: true, tags: true },
        },
      },
    },
    _count: { select: { items: true } },
  } satisfies Prisma.CollectionInclude;
}

type CollectionDetailRow = Prisma.CollectionGetPayload<{
  include: ReturnType<typeof collectionDetailInclude>;
}>;

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: CollectionDetailRow["items"][number]["item"][];
  totalItemCount: number;
}

export async function getCollectionWithItems(
  userId: string,
  collectionId: string,
  page = 1,
): Promise<CollectionDetail | null> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: collectionDetailInclude(page),
  });

  if (!collection) return null;

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    items: collection.items.map((ic) => ic.item),
    totalItemCount: collection._count.items,
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
