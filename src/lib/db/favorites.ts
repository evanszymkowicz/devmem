import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { dominantTypeColor } from "@/lib/db/collections";
import { FAVORITES_PER_SECTION } from "@/lib/db/limits";
import type { ItemWithType } from "@/lib/db/items";

const itemWithTypeInclude = {
  itemType: true,
  tags: true,
} satisfies Prisma.ItemInclude;

export interface FavoriteCollection {
  id: string;
  name: string;
  updatedAt: Date;
  // Color of the collection's dominant item type, used to tint the row icon.
  dominantColor: string;
}

export interface Favorites {
  items: ItemWithType[];
  collections: FavoriteCollection[];
}

// Loads a user's favorited items and collections for the /favorites list,
// each section sorted most-recently-favorited first and bounded by
// FAVORITES_PER_SECTION.
export async function getFavorites(userId: string): Promise<Favorites> {
  const [items, collections] = await Promise.all([
    prisma.item.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      take: FAVORITES_PER_SECTION,
      include: itemWithTypeInclude,
    }),
    prisma.collection.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      take: FAVORITES_PER_SECTION,
      include: {
        items: {
          include: {
            item: {
              include: { itemType: { select: { id: true, color: true } } },
            },
          },
        },
      },
    }),
  ]);

  const favoriteCollections: FavoriteCollection[] = collections.map((col) => ({
    id: col.id,
    name: col.name,
    updatedAt: col.updatedAt,
    dominantColor: dominantTypeColor(col.items.map((ic) => ic.item.itemType)),
  }));

  return { items, collections: favoriteCollections };
}
